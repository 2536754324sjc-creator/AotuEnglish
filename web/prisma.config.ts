// Prisma 7 配置
//
// 为什么需要这个文件：Prisma 7 起 datasource 改为配置驱动，
// schema.prisma 只声明 provider，实际 URL 从 env 读取。
//
// 注意：Prisma 7 **不会自动加载 .env**（旧版会）。必须显式 dotenv，
// 否则 `prisma generate` 会报 PrismaConfigEnvError: Cannot resolve DATABASE_URL。
import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

loadEnv();

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
