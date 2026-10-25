import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth-server';
import { prisma } from '@/lib/db';

/**
 * GET /api/users/me/readings —— 只返回「读到第几页」（契约 §4.9 的读取侧）
 *
 * 为什么只给进度、不给书目：
 * 书目（标题、页面文案、插图）与前端代码一起发布，属于**内容**；
 * 这里只负责属于**学习者**的那部分数据。
 * 若服务端再维护一份书目，改文案就要改两处，必然出现过期数据。
 *
 * 前端用法：拿前端书目 + 这里的 readPages 合并渲染书架。
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

  const learner =
    (await prisma.learner.findFirst({ where: { userId: user.id, active: true } })) ??
    (await prisma.learner.findFirst({ where: { userId: user.id } }));

  if (!learner) {
    return NextResponse.json({ progress: {} });
  }

  const rows = await prisma.readingProgress.findMany({ where: { learnerId: learner.id } });
  const progress: Record<string, number> = {};
  for (const r of rows) progress[r.readingId] = r.readPages;

  return NextResponse.json({ progress });
}

/**
 * PUT /api/users/me/readings/:readingId/progress —— 上报读本进度（契约 §4.9）
 * 请求体：{ readPages: number }
 */
export async function PUT(req: Request) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: '请先登录' } },
      { status: 401 },
    );
  }

  let body: { readingId?: unknown; readPages?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAM', message: '请求体不是合法 JSON' } },
      { status: 400 },
    );
  }

  const readingId = typeof body.readingId === 'string' ? body.readingId : '';
  const readPages = typeof body.readPages === 'number' ? Math.max(0, Math.floor(body.readPages)) : NaN;
  if (!readingId || Number.isNaN(readPages)) {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAM', message: '缺少 readingId 或 readPages' } },
      { status: 400 },
    );
  }

  const learner =
    (await prisma.learner.findFirst({ where: { userId: user.id, active: true } })) ??
    (await prisma.learner.findFirst({ where: { userId: user.id } }));
  if (!learner) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '还没有学习者档案' } },
      { status: 404 },
    );
  }

  // 只前进不后退：重读时不会把进度冲掉
  const existing = await prisma.readingProgress.findUnique({
    where: { learnerId_readingId: { learnerId: learner.id, readingId } },
  });
  const next = Math.max(existing?.readPages ?? 0, readPages);

  const saved = await prisma.readingProgress.upsert({
    where: { learnerId_readingId: { learnerId: learner.id, readingId } },
    create: { learnerId: learner.id, readingId, readPages: next },
    update: { readPages: next },
  });

  return NextResponse.json({ readingId, readPages: saved.readPages });
}
