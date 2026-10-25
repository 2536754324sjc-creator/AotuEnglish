import { randomBytes, createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

/**
 * 鉴权：密码哈希 + 不透明 token 会话。
 *
 * 为什么不直接用 JWT：
 * - 契约 §4.1 要求支持「登出 / 刷新」，不透明 token 才能服务端立即失效
 * - 不需要把密钥分发到多个服务
 *
 * token 在数据库里**只存哈希**：即使库被拖走，也无法直接拿来登录。
 * 这与存密码哈希是同一个理由。
 */

const TOKEN_BYTES = 32;
/** 与前端 mock 的 30 天一致（见 lib/api.ts 的 mock login） */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function newToken(): { token: string; tokenHash: string } {
  const token = randomBytes(TOKEN_BYTES).toString('base64url');
  return { token, tokenHash: hashToken(token) };
}

export type AuthUser = {
  id: string;
  name: string;
  level: string;
  role: string;
};

/** 从请求头取 Bearer token 并校验，返回用户；无效返回 null */
export async function authenticate(req: Request): Promise<AuthUser | null> {
  const header = req.headers.get('authorization') ?? '';
  const m = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!m) return null;

  const tokenHash = hashToken(m[1]);
  const session = await prisma.authSession.findUnique({
    where: { token: tokenHash },
    include: { user: { select: { id: true, name: true, level: true, role: true } } },
  });
  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    // 过期会话顺手清掉，避免表膨胀
    await prisma.authSession.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session.user;
}

/** 未登录的 401 响应体，格式遵循契约 §1.1 */
export function unauthorized(message = '请先登录') {
  return {
    status: 401,
    body: { error: { code: 'UNAUTHORIZED', message } },
  };
}

export function badRequest(code: string, message: string) {
  return { status: 400, body: { error: { code, message } } };
}

export function notFound(message = '资源不存在') {
  return { status: 404, body: { error: { code: 'NOT_FOUND', message } } };
}

export function conflict(code: string, message: string) {
  return { status: 409, body: { error: { code, message } } };
}
