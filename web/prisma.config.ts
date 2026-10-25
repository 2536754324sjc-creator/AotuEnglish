// Prisma 7 配置 —— 同时支持 SQLite（本地）与 PostgreSQL（线上）
//
// 两个要点（都踩过）：
// 1. Prisma 7 起 datasource 改为配置驱动，schema.prisma 里不能再写 `url`
// 2. Prisma 7 **不会自动加载 .env**，必须显式 dotenv，
//    否则会报 PrismaConfigEnvError: Cannot resolve DATABASE_URL
import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

loadEnv();

/**
 * 按连接串协议选择 schema 文件。
 *
 * 为什么用两份 schema 而不是一份：Prisma 的 datasource.provider
 * 是编译期常量，同一个 schema 无法同时声明 sqlite 与 postgresql。
 * 两份仅在 provider 一行不同，其余靠 `npm run schema:sync` 保持一致。
 */
const url = env('DATABASE_URL');
const isPostgres = /^postgres(ql)?:\/\//i.test(url);

export default defineConfig({
  schema: path.join('prisma', isPostgres ? 'schema.postgres.prisma' : 'schema.prisma'),
  migrations: {
    /**
     * 迁移目录也按数据库分开。
     *
     * 为什么不能共用：SQLite 与 PostgreSQL 的 DDL 不兼容
     * （类型、自增、默认值写法都不同），共用会导致线上 migrate deploy 直接失败。
     */
    path: path.join('prisma', isPostgres ? 'migrations-pg' : 'migrations'),
  },
  datasource: {
    url,
  },
});
