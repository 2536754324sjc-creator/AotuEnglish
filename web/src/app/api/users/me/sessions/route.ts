import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth-server';
import { submitSession } from '@/lib/server/grading';
import type { IncomingAnswer } from '@/lib/server/grading';
import { prisma } from '@/lib/db';

/**
 * POST /api/users/me/sessions —— 作答批次上报（契约 §4.6）
 *
 * 请求：{ unitId, startedAt, finishedAt, answers: [{ questionId, optionId, attempts, elapsedMs }] }
 * 200： { sessionId, stars, starTotal, chestRemaining, unitStatus, nextUnitId }
 * 409： SESSION_CONFLICT（10 秒内重复提交，前端应静默忽略）
 *
 * 与旧契约的差异：`optionId` 是新增字段，`correct` 不再采信（服务端判分）。
 * 前端同时带 optionId 与旧字段时，以 optionId 为准。
 */
export const dynamic = 'force-dynamic';

type Body = {
  unitId?: unknown;
  startedAt?: unknown;
  finishedAt?: unknown;
  answers?: unknown;
};

export async function POST(req: Request) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: '请先登录' } },
      { status: 401 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAM', message: '请求体不是合法 JSON' } },
      { status: 400 },
    );
  }

  const unitId = typeof body.unitId === 'string' ? body.unitId : '';
  if (!unitId) {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAM', message: '缺少 unitId' } },
      { status: 400 },
    );
  }
  if (!Array.isArray(body.answers) || body.answers.length === 0) {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAM', message: 'answers 不能为空' } },
      { status: 400 },
    );
  }

  const learner =
    (await prisma.learner.findFirst({ where: { userId: user.id, active: true } })) ??
    (await prisma.learner.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } }));
  if (!learner) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '还没有学习者档案' } },
      { status: 404 },
    );
  }

  const answers: IncomingAnswer[] = (body.answers as Record<string, unknown>[])
    .map((a) => ({
      questionId: typeof a.questionId === 'string' ? a.questionId : '',
      optionId: typeof a.optionId === 'string' ? a.optionId : undefined,
      correct: typeof a.correct === 'boolean' ? a.correct : undefined,
      attempts: typeof a.attempts === 'number' ? a.attempts : 0,
      elapsedMs: typeof a.elapsedMs === 'number' ? a.elapsedMs : -1,
    }))
    .filter((a) => a.questionId);

  const parseDate = (v: unknown, fallback: Date) => {
    if (typeof v !== 'string') return fallback;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? fallback : d;
  };
  const now = new Date();

  const outcome = await submitSession({
    learnerId: learner.id,
    unitId,
    startedAt: parseDate(body.startedAt, now),
    finishedAt: parseDate(body.finishedAt, now),
    answers,
  });

  if (!outcome.ok) {
    const status = outcome.code === 'CONFLICT' ? 409 : outcome.code === 'UNIT_NOT_FOUND' ? 404 : 400;
    const codeMap = {
      CONFLICT: 'SESSION_CONFLICT',
      UNIT_NOT_FOUND: 'NOT_FOUND',
      INCOMPLETE: 'INVALID_PARAM',
    } as const;
    return NextResponse.json(
      { error: { code: codeMap[outcome.code], message: outcome.message } },
      { status },
    );
  }

  return NextResponse.json({
    sessionId: outcome.sessionId,
    stars: outcome.stars,
    starTotal: outcome.starTotal,
    chestRemaining: outcome.chestRemaining,
    unitStatus: outcome.unitStatus,
    nextUnitId: outcome.nextUnitId,
  });
}
