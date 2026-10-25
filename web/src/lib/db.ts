import path from 'node:path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@/generated/prisma/client';

/**
 * Prisma 客户端单例。
 *
 * 为什么必须单例：Next.js 开发模式下热更新会反复执行模块，
 * 每次都 new PrismaClient() 会耗尽数据库连接。
 *
 * Prisma 7 的重要变化（踩过）：
 * - schema.prisma 里**不能**再写 `url`，连接串只放在 prisma.config.ts（迁移）与运行时 adapter
 * - 运行时**必须**传 driver adapter，`datasourceUrl` 已不存在
 * 所以这里用 better-sqlite3 adapter 打开本地文件库。
 *
 * 上线切 PostgreSQL 时：把 adapter 换成 @prisma/adapter-pg 即可，
 * 业务代码（所有 route）不需要改动。
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDbPath(): string {
  const url = process.env.DATABASE_URL ?? 'file:./dev.db';
  const rel = url.replace(/^file:/, '');
  if (path.isAbsolute(rel)) return rel;
  /**
   * 相对路径以**项目根目录**为基准。
   *
   * 实测踩到的坑：Prisma CLI 迁移时（prisma.config.ts 在项目根）把 `file:./dev.db`
   * 解析成 `web/dev.db`，而这里一度拼成 `web/prisma/dev.db`，
   * 结果运行时打开了一个 0 字节的空库 → 查询报「no such table」。
   * 所以基准必须是 cwd，不能是 prisma/ 目录。
   */
  return path.join(process.cwd(), rel.replace(/^\.\//, ''));
}

function createClient(): PrismaClient {
  /**
   * 注意 url 的写法：**不要**再加 `file:` 前缀。
   *
   * 实测踩到的坑：传 `file:F:/.../dev.db` 时，better-sqlite3 adapter 会
   * 再按相对路径解析一遍，最终打开了一个不存在的空库，
   * 报错 "The table `main.User` does not exist in the current database"，
   * 而实际文件里 15 张表都在。直接给绝对路径即可。
   */
  const adapter = new PrismaBetterSqlite3({ url: resolveDbPath() });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
