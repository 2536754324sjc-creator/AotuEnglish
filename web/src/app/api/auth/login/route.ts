import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  hashPassword,
  verifyPassword,
  newToken,
  SESSION_TTL_MS,
} from '@/lib/server/auth-server';

/**
 * POST /api/auth/login —— 登录与注册（契约 §4.1）
 *
 * 请求体：{ email, password, mode: 'login' | 'signup' }
 * 返回：  { token, expiresAt, user }
 *
 * 错误码（与前端 mock 的分支保持一致，前端错误处理代码不用改）：
 * - 400 INVALID_PARAM   参数不合法
 * - 401 UNAUTHORIZED    邮箱或密码不对
 * - 409 EMAIL_TAKEN     注册时邮箱已占用
 */

export const dynamic = 'force-dynamic';

type Body = {
  email?: unknown;
  password?: unknown;
  mode?: unknown;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return fail(400, 'INVALID_PARAM', '请求体不是合法 JSON');
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const mode = body.mode === 'signup' ? 'signup' : 'login';

  if (!EMAIL_RE.test(email)) {
    return fail(400, 'INVALID_PARAM', '邮箱格式不对');
  }
  if (password.length < 8) {
    return fail(400, 'INVALID_PARAM', '密码至少 8 位');
  }

  try {
    if (mode === 'signup') {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) {
        return fail(409, 'EMAIL_TAKEN', '这个邮箱已经注册过了，直接登录吧');
      }

      const name = email.split('@')[0] || 'learner';
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash: await hashPassword(password),
          role: 'parent',
          level: 'kids-a',
          // 注册即建默认学习者与配套记录，避免各页面处理「半初始化」状态
          learners: {
            create: {
              name,
              level: 'kids-a',
              avatar: name.slice(0, 1).toUpperCase(),
              active: true,
              plan: { create: { level: 'kids-a' } },
              progress: { create: {} },
              rewards: { create: {} },
            },
          },
          preferences: { create: {} },
          account: { create: {} },
        },
        include: { learners: true },
      });

      return await issueSession(user.id, user.name, user.level, user.role);
    }

    // 登录
    const user = await prisma.user.findUnique({ where: { email } });
    // 用户不存在时也走一次密码校验，避免通过响应时间判断邮箱是否注册
    const hash = user?.passwordHash ?? '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
    const ok = await verifyPassword(password, hash);
    if (!user || !ok) {
      return fail(401, 'UNAUTHORIZED', '邮箱或密码不对');
    }

    return await issueSession(user.id, user.name, user.level, user.role);
  } catch (e) {
    console.error('[auth/login]', e);
    return fail(500, 'INTERNAL', '服务器出错了，请稍后再试');
  }
}

async function issueSession(userId: string, name: string, level: string, role: string) {
  const { token, tokenHash } = newToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.authSession.create({
    data: { token: tokenHash, userId, expiresAt },
  });

  return NextResponse.json({
    token,
    expiresAt: expiresAt.toISOString(),
    user: { id: userId, name, level, role },
  });
}
