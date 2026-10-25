import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticate } from '@/lib/server/auth-server';
import { SERVER_UNITS, toClientUnit } from '@/lib/server/units';
import type { TodayProgress, UnitStatus } from '@/lib/types';

/**
 * GET /api/users/me/progress —— 今日任务、地图、当前关（契约 §4.5）
 *
 * 数据来源：LearnerProgress.doneUnitsJson + StudySession 历史。
 * 地图状态由「已完成单元」推导，与前端 applyDoneUnits 的规则一致：
 * 完成过的保持 done，当前关是第一个未完成的单元。
 */
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: '请先登录' } },
      { status: 401 },
    );
  }

  // 取当前学习者；没有就用第一个
  const learner =
    (await prisma.learner.findFirst({ where: { userId: user.id, active: true } })) ??
    (await prisma.learner.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } }));

  if (!learner) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '还没有学习者档案' } },
      { status: 404 },
    );
  }

  const progress = await prisma.learnerProgress.findUnique({ where: { learnerId: learner.id } });
  const plan = await prisma.studyPlan.findUnique({ where: { learnerId: learner.id } });
  const doneIds: string[] = progress ? safeJsonArray(progress.doneUnitsJson) : [];
  const done = new Set(doneIds);

  // 今日星数：按本地日期切分当天的作答
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todaySessions = await prisma.studySession.findMany({
    where: { learnerId: learner.id, createdAt: { gte: startOfToday } },
    select: { stars: true },
  });
  const starsToday = todaySessions.reduce((n, s) => n + s.stars, 0);

  // 当前关 = 第一个未完成
  const firstOpen = SERVER_UNITS.findIndex((u) => !done.has(u.unitId));

  const units = SERVER_UNITS.map((u, i) => {
    let status: UnitStatus = 'locked';
    if (done.has(u.unitId)) status = 'done';
    else if (i === firstOpen) status = 'current';
    return toClientUnit(u, status);
  });

  const payload: TodayProgress = {
    learnerName: learner.name,
    level: (learner.level as TodayProgress['level']) ?? 'kids-a',
    starsToday,
    starsGoal: plan?.dailyStars ?? 5,
    starTotal: progress?.starTotal ?? 0,
    currentUnitIndex: firstOpen >= 0 ? firstOpen : SERVER_UNITS.length - 1,
    chestRemaining: Math.max(0, (progress?.chestRemaining ?? 2) - Math.floor(starsToday / 3)),
    units,
  };

  return NextResponse.json(payload);
}

function safeJsonArray(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
