import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth-server';
import { prisma } from '@/lib/db';

/**
 * GET/PUT /api/users/me/learners —— 学习者管理（家长端 /parent/learners）
 *
 * 规则：一个账号最多 4 个档案（对应多孩家庭版），且恰好一个 active。
 * 「恰好一个 active」由本接口保证 —— 若交给客户端维护，
 * 并发操作很容易出现零个或多个当前学习者，进度归属就乱了。
 */
export const dynamic = 'force-dynamic';

const MAX_LEARNERS = 4;
const LEVELS = ['kids-a', 'kids-b', 'teen', 'adult'];

function toDto(l: {
  id: string;
  name: string;
  level: string;
  avatar: string;
  birthYear: number | null;
  createdAt: Date;
  active: boolean;
}) {
  return {
    id: l.id,
    name: l.name,
    level: l.level,
    avatar: l.avatar,
    birthYear: l.birthYear,
    createdAt: l.createdAt.toISOString().slice(0, 10),
    active: l.active,
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

  const list = await prisma.learner.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ items: list.map(toDto) });
}

export async function PUT(req: Request) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: '请先登录' } },
      { status: 401 },
    );
  }

  let body: { items?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAM', message: '请求体不是合法 JSON' } },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.items)) {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAM', message: 'items 必须是数组' } },
      { status: 400 },
    );
  }

  const incoming = (body.items as Record<string, unknown>[])
    .map((x) => ({
      id: typeof x.id === 'string' ? x.id : '',
      name: typeof x.name === 'string' ? x.name.trim() : '',
      level: typeof x.level === 'string' && LEVELS.includes(x.level) ? x.level : 'kids-a',
      active: x.active === true,
    }))
    .filter((x) => x.id && x.name);

  if (incoming.length > MAX_LEARNERS) {
    return NextResponse.json(
      {
        error: {
          code: 'LIMIT_EXCEEDED',
          message: `最多 ${MAX_LEARNERS} 个学习档案`,
        },
      },
      { status: 400 },
    );
  }

  // 重名会让周报分不清是谁
  const names = incoming.map((i) => i.name);
  if (new Set(names).size !== names.length) {
    return NextResponse.json(
      { error: { code: 'DUPLICATE_NAME', message: '学习者名字不能重复' } },
      { status: 400 },
    );
  }

  // 保证恰好一个 active
  let activeIdx = incoming.findIndex((i) => i.active);
  if (activeIdx < 0) activeIdx = 0;
  if (incoming.length === 0) {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAM', message: '至少保留一个学习者档案' } },
      { status: 400 },
    );
  }

  const existing = await prisma.learner.findMany({ where: { userId: user.id }, select: { id: true } });
  const existingIds = new Set(existing.map((e) => e.id));
  const keepIds = new Set(incoming.map((i) => i.id).filter((id) => existingIds.has(id)));

  await prisma.$transaction(async (tx) => {
    // 删除被移除的档案（其进度、作答会级联删除）
    const toDelete = [...existingIds].filter((id) => !keepIds.has(id));
    if (toDelete.length) {
      await tx.learner.deleteMany({ where: { id: { in: toDelete }, userId: user.id } });
    }

    for (let i = 0; i < incoming.length; i++) {
      const item = incoming[i];
      const isActive = i === activeIdx;

      if (existingIds.has(item.id)) {
        await tx.learner.update({
          where: { id: item.id },
          data: { name: item.name, level: item.level, active: isActive },
        });
      } else {
        // 新增：同时补齐配套记录，避免页面处理半初始化状态
        await tx.learner.create({
          data: {
            userId: user.id,
            name: item.name,
            level: item.level,
            avatar: item.name.slice(0, 1).toUpperCase(),
            active: isActive,
            plan: { create: { level: item.level } },
            progress: { create: {} },
            rewards: { create: {} },
          },
        });
      }
    }
  });

  const list = await prisma.learner.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ items: list.map(toDto) });
}
