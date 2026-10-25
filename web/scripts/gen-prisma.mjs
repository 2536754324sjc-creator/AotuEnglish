#!/usr/bin/env node
/**
 * 生成两套 Prisma Client（SQLite / PostgreSQL）。
 *
 * 为什么必须两套：Prisma 生成的 Client 与 schema 的 provider 编译期绑定，
 * 无法运行时切换（实测报 "adapter-pg is not compatible with provider sqlite"）。
 * 本地用 SQLite 版，线上用 PG 版，由 src/lib/db.ts 按连接串选择。
 *
 * 只生成当前环境需要的那套会导致另一种环境直接 import 失败，
 * 所以部署与本地都统一生成两套（各约 150ms，代价可忽略）。
 */
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

/**
 * 直接调用 Prisma 的 JS 入口，而不是 `npx`。
 *
 * 为什么：Windows 上 `npx.cmd` 必须经过 shell 才能执行，
 * 而 shell: true 会把参数拼进命令行（Node 告警 DEP0190，且是注入面）。
 * 用当前 node 直接跑 prisma/build/index.js 两个问题都没有。
 */
const require = createRequire(import.meta.url);
const PRISMA_BIN = require.resolve('prisma/build/index.js');

const targets = [
  ['prisma/schema.prisma', 'SQLite'],
  ['prisma/schema.postgres.prisma', 'PostgreSQL'],
];

let failed = false;
for (const [schema, label] of targets) {
  process.stdout.write(`生成 ${label} Client… `);
  const r = spawnSync(process.execPath, [PRISMA_BIN, 'generate', '--schema', schema], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  if (r.status === 0) {
    console.log('OK');
  } else {
    failed = true;
    console.log('FAILED');
    console.error(r.stdout || '');
    console.error(r.stderr || '');
  }
}

if (failed) {
  console.error('生成失败：请检查 schema 与网络');
  process.exit(1);
}
console.log('两套 Client 均已就绪');
