#!/usr/bin/env node
/**
 * 同步两份 schema（SQLite / PostgreSQL）。
 *
 * 为什么需要：Prisma 的 datasource.provider 是编译期常量，
 * 无法用同一份 schema 同时支持 sqlite 与 postgresql。
 * 两份文件只允许在 provider 那一行不同 —— 其它任何差异都会导致
 * 「本地跑得通、线上报字段不存在」这类难查的问题。
 *
 * 用法：
 *   node scripts/sync-schema.mjs          以 schema.prisma 为准重新生成 PG 版
 *   node scripts/sync-schema.mjs --check  只检查是否一致（CI 用）
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SQLITE = join(ROOT, 'prisma', 'schema.prisma');
const PG = join(ROOT, 'prisma', 'schema.postgres.prisma');

const PROVIDER_SQLITE = 'provider = "sqlite"';
const PROVIDER_PG = 'provider = "postgresql"';

const base = readFileSync(SQLITE, 'utf8');
if (!base.includes(PROVIDER_SQLITE)) {
  console.error(`✗ ${SQLITE} 里找不到 ${PROVIDER_SQLITE}`);
  process.exit(1);
}

const expected = base.replace(PROVIDER_SQLITE, PROVIDER_PG);

if (process.argv.includes('--check')) {
  let actual = '';
  try {
    actual = readFileSync(PG, 'utf8');
  } catch {
    console.error('✗ schema.postgres.prisma 不存在，请运行 npm run schema:sync');
    process.exit(1);
  }
  if (actual.trim() !== expected.trim()) {
    console.error('✗ 两份 schema 不一致，请运行 npm run schema:sync');
    console.error('  （只允许 provider 一行不同）');
    process.exit(1);
  }
  console.log('✓ 两份 schema 一致');
  process.exit(0);
}

writeFileSync(PG, expected, 'utf8');
console.log('✓ 已由 schema.prisma 重新生成 schema.postgres.prisma');
