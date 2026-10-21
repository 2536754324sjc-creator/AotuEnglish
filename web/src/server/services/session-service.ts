import { randomUUID } from 'node:crypto';
import type { Question, TodayProgress } from '@/lib/types';
import type { PracticeSessionRecord, SessionAnswerRecord } from '../domain/types';
import { scoreSubmission, type SubmitAnswer } from '../domain/rules';
import { ApiError } from '../http/api';
import { getRepository } from '../repositories';
import type { Repository } from '../repositories/types';
import { getTodayProgress } from './progress-service';

const MAX_DURATION_MS = 6 * 60 * 60 * 1000;
const MAX_ANSWERS = 100;
const MAX_ATTEMPTS = 100;

export type SessionSummary = {
  id: string;
  unitId: string;
  clientSessionId: string;
  stars: number;
  totalQuestions: number;
  correctFirstTry: number;
  accuracy: number;
  durationMs: number;
  finishedAt: string;
};

export type SubmitSessionResult = {
  session: SessionSummary;
  progress: TodayProgress;
  deduplicated: boolean;
};

function asRecord(value: unknown, message: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError('BAD_REQUEST', message);
  }
  return value as Record<string, unknown>;
}

function requireText(record: Record<string, unknown>, field: string, maxLength = 200): string {
  const value = record[field];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ApiError('BAD_REQUEST', `缺少字段 ${field}`);
  }
  const text = value.trim();
  if (text.length > maxLength) {
    throw new ApiError('BAD_REQUEST', `字段 ${field} 过长`);
  }
  return text;
}

function requireInteger(
  record: Record<string, unknown>,
  field: string,
  min: number,
  max: number,
): number {
  const value = record[field];
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw new ApiError('BAD_REQUEST', `字段 ${field} 必须是 ${min}–${max} 的整数`);
  }
  return value;
}

function parseAnswers(value: unknown): SubmitAnswer[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ApiError('BAD_REQUEST', 'answers 不能为空');
  }
  if (value.length > MAX_ANSWERS) {
    throw new ApiError('BAD_REQUEST', 'answers 条数过多');
  }

  return value.map((item, index) => {
    const record = asRecord(item, `answers[${index}] 必须是对象`);
    const questionId = requireText(record, 'questionId');
    const selectedOptionId = requireText(record, 'selectedOptionId');
    const attempts = requireInteger(record, 'attempts', 1, MAX_ATTEMPTS);
    return { questionId, selectedOptionId, attempts };
  });
}

function parseStartedAt(value: unknown, now: Date): string {
  if (value === undefined || value === null) return now.toISOString();
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw new ApiError('BAD_REQUEST', '字段 startedAt 必须是 ISO 时间字符串');
  }
  return new Date(value).toISOString();
}

/** 校验作答覆盖全部题目、不重复、选项属于对应题目 */
function findCoverageIssues(questions: Question[], answers: SubmitAnswer[]): string[] {
  const byId = new Map(questions.map((question) => [question.id, question]));
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const answer of answers) {
    const question = byId.get(answer.questionId);
    if (!question) {
      issues.push(`题目 ${answer.questionId} 不属于该单元`);
      continue;
    }
    if (seen.has(answer.questionId)) {
      issues.push(`题目 ${answer.questionId} 重复提交`);
      continue;
    }
    seen.add(answer.questionId);
    if (!question.options.some((option) => option.id === answer.selectedOptionId)) {
      issues.push(`选项 ${answer.selectedOptionId} 不属于题目 ${answer.questionId}`);
    }
  }

  const missing = questions.filter((question) => !seen.has(question.id)).map((q) => q.id);
  if (missing.length > 0) issues.push(`缺少作答：${missing.join(', ')}`);

  return issues;
}

function summarize(session: PracticeSessionRecord): SessionSummary {
  return {
    id: session.id,
    unitId: session.unitId,
    clientSessionId: session.clientSessionId,
    stars: session.stars,
    totalQuestions: session.totalQuestions,
    correctFirstTry: session.correctFirstTry,
    accuracy:
      session.totalQuestions === 0
        ? 0
        : Math.round((session.correctFirstTry / session.totalQuestions) * 100),
    durationMs: session.durationMs,
    finishedAt: session.finishedAt,
  };
}

/**
 * 一次练习的批提交。
 * 幂等：同一 (learnerId, clientSessionId) 重复提交返回首次结果，不重复加星。
 */
export async function submitSession(
  learnerId: string,
  body: unknown,
  repo: Repository = getRepository(),
  now: Date = new Date(),
): Promise<SubmitSessionResult> {
  const record = asRecord(body, '请求体必须是 JSON 对象');
  const unitId = requireText(record, 'unitId');
  const clientSessionId = requireText(record, 'clientSessionId', 100);
  const durationMs = requireInteger(record, 'durationMs', 0, MAX_DURATION_MS);
  const answers = parseAnswers(record.answers);
  const startedAt = parseStartedAt(record.startedAt, now);

  const learner = await repo.findLearner(learnerId);
  if (!learner) throw new ApiError('LEARNER_NOT_FOUND', '找不到这个学习者');

  const existing = await repo.findSessionByClientId(learnerId, clientSessionId);
  if (existing) {
    return {
      session: summarize(existing),
      progress: await getTodayProgress(learnerId, repo, now),
      deduplicated: true,
    };
  }

  const unit = await repo.findUnit(unitId);
  if (!unit) throw new ApiError('UNIT_NOT_FOUND', '找不到这一关');
  if (unit.questions.length === 0) {
    throw new ApiError('UNPROCESSABLE', '这一关还没有题目');
  }

  const issues = findCoverageIssues(unit.questions, answers);
  if (issues.length > 0) {
    throw new ApiError('UNPROCESSABLE', '作答数据不完整或不合法', { issues });
  }

  const score = scoreSubmission(unit.questions, answers);
  const finishedAt = now.toISOString();
  const answerById = new Map(answers.map((answer) => [answer.questionId, answer]));

  const sessionAnswers: SessionAnswerRecord[] = unit.questions.map((question) => {
    const answer = answerById.get(question.id);
    const selected = question.options.find((option) => option.id === answer?.selectedOptionId);
    return {
      questionId: question.id,
      selectedOptionId: answer?.selectedOptionId ?? '',
      correct: Boolean(selected?.correct),
      attempts: answer?.attempts ?? 1,
    };
  });

  const session: PracticeSessionRecord = {
    id: `sess_${randomUUID()}`,
    learnerId,
    unitId,
    clientSessionId,
    stars: score.stars,
    totalQuestions: score.totalQuestions,
    correctFirstTry: score.correctFirstTry,
    durationMs,
    startedAt,
    finishedAt,
    answers: sessionAnswers,
  };

  await repo.insertSession(session);

  const progressList = await repo.listProgress(learnerId);
  const previous = progressList.find((item) => item.unitId === unitId);
  await repo.saveProgress({
    learnerId,
    unitId,
    // 重玩只升不降
    stars: Math.max(previous?.stars ?? 0, score.stars),
    attempts: (previous?.attempts ?? 0) + 1,
    // 首次完成时间不覆盖，避免重玩重复计入「今日星数」
    completedAt: previous?.completedAt ?? finishedAt,
  });

  return {
    session: summarize(session),
    progress: await getTodayProgress(learnerId, repo, now),
    deduplicated: false,
  };
}
