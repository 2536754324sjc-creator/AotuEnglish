import path from 'node:path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * 数据库客户端 —— 同时支持 SQLite（本地）与 PostgreSQL（线上）。
 *
 * 关键约束（踩过，会导致线上直接 500）：
 * **Prisma 生成的 Client 与 schema 的 provider 是编译期绑定的**，
 * 不能用同一个 Client 在运行时切数据库。否则会报：
 *   "The Driver Adapter `@prisma/adapter-pg` is not compatible with
 *    the provider `sqlite` specified in the Prisma schema"
 *
 * 所以这里：
 * - 两套 Client 分别由 schema.prisma / schema.postgres.prisma 生成
 * - 运行时按 DATABASE_URL 的协议选一套
 * - 类型层面用 `DatabaseClient` 取并集，业务代码（所有 route）不需要条件分支
 *
 * 本地开发用 SQLite，零依赖；线上（Vercel）用 PostgreSQL，因为无状态平台
 * 无法持久化数据库文件。
 */

const DATABASE_URL = process.env.DATABASE_URL ?? 'file:./dev.db';

export function isPostgresUrl(url: string): boolean {
  return /^postgres(ql)?:\/\//i.test(url);
}

/** SQLite 的相对路径以项目根为基准（与 prisma.config.ts 的解析一致） */
function resolveSqlitePath(url: string): string {
  const rel = url.replace(/^file:/, '');
  if (path.isAbsolute(rel)) return rel;
  return path.join(process.cwd(), rel.replace(/^\.\//, ''));
}

/**
 * 两套 Client 的公共类型。
 *
 * 为什么这样写：两套 Client 的模型 API 完全一致（同一份 schema 派生），
 * 差异只在内部 driver。用 SQLite 版作为公共类型即可，
 * 避免在每个 route 里写 `isPostgres ? ... : ...` 分支。
 */
type DatabaseClient = import('../../prisma/generated/client').PrismaClient;

const globalForPrisma = globalThis as unknown as {
  prisma: DatabaseClient | undefined;
  prismaUrl: string | undefined;
};

function createClient(): DatabaseClient {
  if (isPostgresUrl(DATABASE_URL)) {
    const needsSsl =
      /sslmode=(require|verify-ca|verify-full)/i.test(DATABASE_URL) ||
      /neon\.tech|supabase\.co|render\.com/i.test(DATABASE_URL);

    // 延迟 require：SQLite 环境下不加载 pg，避免无谓的模块初始化
    const { PrismaClient: PgClient } = require('../../prisma/generated-pg/client') as {
      PrismaClient: new (opts: unknown) => DatabaseClient;
    };

    const adapter = new PrismaPg({
      connectionString: DATABASE_URL,
      ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    });

    return new PgClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  /**
   * SQLite：url 不加 file: 前缀。
   * 踩过的坑：传 `file:F:/.../dev.db` 时 better-sqlite3 会再按相对路径解析，
   * 最终打开一个空库并报 "table main.User does not exist"。
   */
  const { PrismaClient: SqliteClient } = require('../../prisma/generated/client') as {
    PrismaClient: new (opts: unknown) => DatabaseClient;
  };

  const adapter = new PrismaBetterSqlite3({ url: resolveSqlitePath(DATABASE_URL) });

  return new SqliteClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

/**
 * 单例，但要记住用的是哪个连接串。
 *
 * 为什么记 url：开发时切换 DATABASE_URL 后热更新会复用 globalThis 上的旧实例，
 * 导致「明明改了配置却还连着旧库」。连接串变了就重建。
 */
function getClient(): DatabaseClient {
  const cached = globalForPrisma.prisma;
  if (cached && globalForPrisma.prismaUrl === DATABASE_URL) return cached;

  const client = createClient();
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaUrl = DATABASE_URL;
  }
  return client;
}

export const prisma: DatabaseClient = new Proxy({} as DatabaseClient, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
