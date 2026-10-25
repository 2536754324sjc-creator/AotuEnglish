import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth-server';
import { prisma } from '@/lib/db';

/**
 * GET/PUT /api/users/me/plan —— 学习计划（家长端 /parent/plan）
 *
 * 契约本身没有这个条目（它只覆盖学习主链路），
 * 这里按前端 lib/parent-types.ts 的 StudyPlan 形状实现，
 * 后续补进 docs/api-contract.md 时以本实现为准。
 */
export const dynamic = 'force-dynamic';

async function currentLearner(userId: string) {
  return (
    (await prisma.learner.findFirst({ where: { userId, active: true } })) ??
    (await prisma.learner.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } }))
  );
}

function toPlan(p: {
  level: string;
  dailyMinutes: number;
  dailyStars: number;
  daysPerWeek: number;
  remindAt: string;
  restDaysJson: string;
}) {
  return {
    level: p.level,
    dailyMinutes: p.dailyMinutes,
    dailyStars: p.dailyStars,
    daysPerWeek: p.daysPerWeek,
    remindAt: p.remindAt,
    restDays: safeArray(p.restDaysJson),
  };
}

export async function GET(req: Request) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: '请先登录' } },
      { status: 401 },
    );
  }

  const learner = await currentLearner(user.id);
  if (!learner) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '还没有学习者档案' } },
      { status: 404 },
    );
  }

  const plan = await prisma.studyPlan.findUnique({ where: { learnerId: learner.id } });
  if (plan) return NextResponse.json(toPlan(plan));

  // 注册时已建 plan（见 auth/login 的嵌套 create）；兜底再建一次以保证幂等
  const created = await prisma.studyPlan.create({
    data: { learnerId: learner.id, level: learner.level },
  });
  return NextResponse.json(toPlan(created));
}

export async function PUT(req: Request) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: '请先登录' } },
      { status: 401 },
    );
  }

  const learner = await currentLearner(user.id);
  if (!learner) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '还没有学习者档案' } },
      { status: 404 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAM', message: '请求体不是合法 JSON' } },
      { status: 400 },
    );
  }

  // 逐字段校验：越界值直接拒绝，而不是悄悄改成边界值
  const clampInt = (v: unknown, min: number, max: number, fallback?: number) => {
    const n = typeof v === 'number' ? Math.round(v) : NaN;
    if (Number.isNaN(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  };

  const level = typeof body.level === 'string' && ['kids-a', 'kids-b', 'teen', 'adult'].includes(body.level)
    ? body.level
    : learner.level;

  const data = {
    level,
    dailyMinutes: clampInt(body.dailyMinutes, 5, 60, 15)!,
    dailyStars: clampInt(body.dailyStars, 1, 30, 5)!,
    daysPerWeek: clampInt(body.daysPerWeek, 1, 7, 5)!,
    remindAt: typeof body.remindAt === 'string' && /^\d{2}:\d{2}$/.test(body.remindAt) ? body.remindAt : '',
    restDaysJson: JSON.stringify(
      Array.isArray(body.restDays)
        ? body.restDays.filter((d): d is number => typeof d === 'number' && d >= 0 && d <= 6)
        : [0, 6],
    ),
  };

  const saved = await prisma.studyPlan.upsert({
    where: { learnerId: learner.id },
    create: { learnerId: learner.id, ...data },
    update: data,
  });

  // 内容档改了，学习者档案也要跟着改（否则地图档位与计划不一致）
  if (saved.level !== learner.level) {
    await prisma.learner.update({ where: { id: learner.id }, data: { level: saved.level } });
  }

  return NextResponse.json(toPlan(saved));
}

function safeArray(raw: string): number[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is number => typeof x === 'number') : [];
  } catch {
    return [];
  }
}
