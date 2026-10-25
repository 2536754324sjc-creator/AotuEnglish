import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth-server';
import { findUnit, toClientUnit } from '@/lib/server/units';
import { prisma } from '@/lib/db';
import type { UnitStatus } from '@/lib/types';

/**
 * GET /api/units/:unitId —— 单元详情与全部题目（契约 §4.4）
 *
 * 安全要点：**不下发正确答案**。
 * 客户端只拿到选项 id 和展示信息，对错由 POST /users/me/sessions 在服务端裁决。
 * 这是契约 §10 第 5 条选 B 方案的落地。
 */
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ unitId: string }> },
) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: '请先登录' } },
      { status: 401 },
    );
  }

  const { unitId } = await params;
  const unit = findUnit(unitId);
  if (!unit) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '找不到这一关' } },
      { status: 404 },
    );
  }

  // 判断状态：已完成 / 当前 / 未解锁
  const learner =
    (await prisma.learner.findFirst({ where: { userId: user.id, active: true } })) ??
    (await prisma.learner.findFirst({ where: { userId: user.id } }));

  let status: UnitStatus = 'current';
  if (learner) {
    const progress = await prisma.learnerProgress.findUnique({
      where: { learnerId: learner.id },
    });
    const done: string[] = progress ? safeArray(progress.doneUnitsJson) : [];
    status = done.includes(unitId) ? 'done' : 'current';
  }

  return NextResponse.json({ unit: toClientUnit(unit, status) });
}

function safeArray(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
