import { prisma } from '@/lib/db';
import { findUnit, unitWords, SERVER_UNITS } from '@/lib/server/units';
import type { ServerUnit } from '@/lib/server/units';

/**
 * 服务端判分与作答记录。
 *
 * 为什么判分必须在服务端（契约 §9、§10 第 5 条）：
 * 之前题目把 `options[].correct` 下发给前端，学生按 F12 就能看到答案。
 * 现在客户端只提「选了什么」，对错由这里裁决。
 *
 * 幂等：同一单元 10 秒内重复提交返回 409（契约 §4.6），
 * 防止双击结算按钮重复加星。
 */

export const SESSION_CONFLICT_MS = 10_000;

export type IncomingAnswer = {
  questionId: string;
  /** 学生选的选项 id（客户端提交的是选择，不是对错） */
  optionId?: string;
  /** 兼容旧载荷：客户端自行判断的对错，服务端不采信，仅用于对比日志 */
  correct?: boolean;
  attempts?: number;
  elapsedMs?: number;
};

export type GradeResult = {
  questionId: string;
  correct: boolean;
  attempts: number;
  elapsedMs: number;
};

/** 对单题判分 */
export function gradeAnswer(unit: ServerUnit, a: IncomingAnswer): GradeResult {
  const q = unit.questions.find((x) => x.id === a.questionId);
  const attempts = typeof a.attempts === 'number' && a.attempts >= 0 ? a.attempts : 0;
  const elapsedMs = typeof a.elapsedMs === 'number' ? a.elapsedMs : -1;

  if (!q) {
    // 未知题目：判错但不崩，便于发现内容与契约不一致
    return { questionId: a.questionId, correct: false, attempts, elapsedMs };
  }

  const picked = a.optionId ? q.options.find((o) => o.id === a.optionId) : undefined;
  const correct = Boolean(picked?.correct);

  return { questionId: a.questionId, correct, attempts, elapsedMs };
}

/**
 * 星级：与前端答题机同一口径 —— 全对 3 星，≥70% 2 星，其余 1 星。
 * 注意口径依据是「一次答对」的题数，所以 attempts===1 才算数。
 */
export function computeStars(results: GradeResult[], totalQuestions: number): 1 | 2 | 3 {
  if (totalQuestions === 0) return 1;
  const firstTry = results.filter((r) => r.correct && r.attempts === 1).length;
  const ratio = firstTry / totalQuestions;
  if (ratio >= 1) return 3;
  if (ratio >= 0.7) return 2;
  return 1;
}

export type SubmitOutcome =
  | {
      ok: true;
      sessionId: string;
      stars: 1 | 2 | 3;
      starTotal: number;
      chestRemaining: number;
      unitStatus: 'done';
      nextUnitId: string | null;
    }
  | { ok: false; code: 'CONFLICT' | 'UNIT_NOT_FOUND' | 'INCOMPLETE'; message: string };

/**
 * 处理一次整关提交：判分 → 落库 → 推进进度 → 解锁词卡与复习项。
 *
 * 全部在一个事务里，避免「星星加了但进度没记上」这类半完成状态。
 */
export async function submitSession(params: {
  learnerId: string;
  unitId: string;
  startedAt: Date;
  finishedAt: Date;
  answers: IncomingAnswer[];
}): Promise<SubmitOutcome> {
  const { learnerId, unitId, startedAt, finishedAt, answers } = params;

  const unit = findUnit(unitId);
  if (!unit) {
    return { ok: false, code: 'UNIT_NOT_FOUND', message: '单元不存在' };
  }

  // 幂等检查：10 秒内同一单元重复提交
  const recent = await prisma.studySession.findFirst({
    where: {
      learnerId,
      unitId,
      createdAt: { gte: new Date(Date.now() - SESSION_CONFLICT_MS) },
    },
    select: { id: true },
  });
  if (recent) {
    return { ok: false, code: 'CONFLICT', message: '这一关刚刚已经提交过了' };
  }

  const results = answers.map((a) => gradeAnswer(unit, a));
  const answeredAll = results.length >= unit.questions.length;
  if (!answeredAll) {
    return { ok: false, code: 'INCOMPLETE', message: '还有题目没有作答' };
  }

  const stars = computeStars(results, unit.questions.length);

  return prisma.$transaction(async (tx) => {
    const session = await tx.studySession.create({
      data: {
        learnerId,
        unitId,
        startedAt,
        finishedAt,
        stars,
        answersJson: JSON.stringify(results),
      },
    });

    // 进度：累加星星、记录完成单元
    const existing = await tx.learnerProgress.findUnique({ where: { learnerId } });
    const doneIds = safeArray(existing?.doneUnitsJson);
    if (!doneIds.includes(unitId)) doneIds.push(unitId);

    const starTotal = (existing?.starTotal ?? 0) + stars;
    const chestRemaining = Math.max(0, (existing?.chestRemaining ?? 2) - 1);

    await tx.learnerProgress.upsert({
      where: { learnerId },
      create: {
        learnerId,
        starTotal,
        chestRemaining,
        doneUnitsJson: JSON.stringify(doneIds),
        currentUnitId: nextUnitId(unitId),
      },
      update: {
        starTotal,
        chestRemaining,
        doneUnitsJson: JSON.stringify(doneIds),
        currentUnitId: nextUnitId(unitId),
      },
    });

    // 词卡解锁：本单元的词全部收集（upsert 保证重复提交不产生重复行）
    for (const word of unitWords(unit)) {
      await tx.learnerWord.upsert({
        where: { learnerId_word: { learnerId, word } },
        create: { learnerId, word, unitZh: unit.titleZh },
        update: {},
      });
    }

    // 复习项：答错过的题对应的词进入复习队列
    const wrongWords = new Set<string>();
    for (const r of results) {
      if (r.correct) continue;
      const q = unit.questions.find((x) => x.id === r.questionId);
      if (q?.audioText) wrongWords.add(q.audioText);
    }
    for (const word of wrongWords) {
      await tx.reviewItem.upsert({
        where: { learnerId_word: { learnerId, word } },
        create: { learnerId, word, unitZh: unit.titleZh, dueDays: 1, wrongCount: 1 },
        update: { wrongCount: { increment: 1 }, dueDays: 1 },
      });
    }

    return {
      ok: true as const,
      sessionId: session.id,
      stars,
      starTotal,
      chestRemaining,
      unitStatus: 'done' as const,
      nextUnitId: nextUnitId(unitId),
    };
  });
}

function nextUnitId(unitId: string): string | null {
  const i = SERVER_UNITS.findIndex((u) => u.unitId === unitId);
  if (i < 0) return null;
  return SERVER_UNITS[i + 1]?.unitId ?? null;
}

function safeArray(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
