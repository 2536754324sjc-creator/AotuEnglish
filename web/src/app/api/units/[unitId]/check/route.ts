import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth-server';
import { findUnit } from '@/lib/server/units';

/**
 * POST /api/units/:unitId/check —— 单题判分（服务端判分模式的必需接口）
 *
 * 为什么需要它：改成服务端判分后，单元下发的选项**不含** correct（契约 §10 第 5 条），
 * 所以答题机无法自己判断对错，必须逐题问服务端。
 *
 * 这是对契约的**补充**：原契约 §4.6 只在整关结束时提交一次，
 * 那时学生已经答完了，中间过程没有判分依据。
 * 逐题判分的代价是每题一次往返（见契约 §10 选项 B 的说明，当时已预判此代价）。
 *
 * 请求：{ questionId, optionId }
 * 200： { correct: boolean }
 *
 * 注意：这里不落库、不加星，纯判分。星级仍由整关提交时统一裁定，
 * 避免「逐题请求被重放刷星」。
 */
export const dynamic = 'force-dynamic';

export async function POST(
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

  let body: { questionId?: unknown; optionId?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAM', message: '请求体不是合法 JSON' } },
      { status: 400 },
    );
  }

  const questionId = typeof body.questionId === 'string' ? body.questionId : '';
  const optionId = typeof body.optionId === 'string' ? body.optionId : '';

  const q = unit.questions.find((x) => x.id === questionId);
  if (!q) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '题目不存在' } },
      { status: 404 },
    );
  }

  const correct = Boolean(q.options.find((o) => o.id === optionId)?.correct);
  return NextResponse.json({ correct });
}
