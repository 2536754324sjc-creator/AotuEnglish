import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { prisma } from '@/lib/db';
import { authenticate } from '@/lib/server/auth-server';

/**
 * POST /api/auth/logout —— 主动失效当前 token（契约 §4.1 提到的补充接口）
 *
 * 为什么需要：token 存在 localStorage，前端「退出登录」如果只删本地副本，
 * 服务端那张票依然有效（直到 30 天后过期）。登出必须服务端也删。
 */
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const user = await authenticate(req);
  if (!user) {
    // 已经无效的 token 再登出一次，视为成功（幂等）
    return NextResponse.json({ ok: true });
  }

  const header = req.headers.get('authorization') ?? '';
  const token = /^Bearer\s+(.+)$/i.exec(header.trim())?.[1] ?? '';
  const tokenHash = createHash('sha256').update(token).digest('hex');

  await prisma.authSession.deleteMany({ where: { token: tokenHash } });
  return NextResponse.json({ ok: true });
}
