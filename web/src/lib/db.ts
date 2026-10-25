import path from 'node:path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/client';

/**
 * Prisma 客户端单例 —— 同时支持 SQLite（本地）与 PostgreSQL（线上）。
 *
 * 为什么要双支持：
 * - 本地开发用 SQLite，零依赖即可跑通
 * - Vercel 是无状态平台，文件型数据库无法持久化，线上必须用 PostgreSQL
 * 两者共用同一份 schema 与业务代码，只有 adapter 不同。
 *
 * 怎么选：看 DATABASE_URL 的协议头
 *   file:./dev.db             → SQLite
 *   postgres://... | postgresql://... → PostgreSQL
 *
 * Prisma 7 的两个坑（都踩过）：
 * 1. schema.prisma 里不能写 url，连接串只在这里给
 * 2. 运行时**必须**传 driver adapter，不存在 datasourceUrl 选项
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function isPostgres(url: string): boolean {
  return /^postgres(ql)?:\/\//i.test(url);
}

/** SQLite 的相对路径以项目根为基准（与 prisma.config.ts 的解析一致） */
function resolveSqlitePath(url: string): string {
  const rel = url.replace(/^file:/, '');
  if (path.isAbsolute(rel)) return rel;
  return path.join(process.cwd(), rel.replace(/^\.\//, ''));
}

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? 'file:./dev.db';

  if (isPostgres(url)) {
    /**
     * Neon 等托管 PG 通常要求 SSL。连接串里带 sslmode=require 即可，
     * 这里显式传 ssl 以兼容不带参数的情况。
     * rejectUnauthorized: false 是为了兼容 Neon 的证书链（其根证书不在常见信任库里）。
     */
    const needsSsl = /sslmode=(require|verify-ca|verify-full)/i.test(url) || /neon\.tech/i.test(url);
    const adapter = new PrismaPg({
      connectionString: url,
      ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  /**
   * SQLite：url 不加 file: 前缀。
   * 踩过的坑：传 `file:F:/.../dev.db` 时 better-sqlite3 会再按相对路径解析，
   * 最终打开一个空库并报 "table main.User does not exist"。
   */
  const adapter = new PrismaBetterSqlite3({ url: resolveSqlitePath(url) });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
