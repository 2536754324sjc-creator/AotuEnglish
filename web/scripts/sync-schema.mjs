#!/usr/bin/env node
/**
 * 同步两份 schema（SQLite / PostgreSQL）。
 *
 * 为什么需要两份：Prisma 的 datasource.provider 与生成的 Client 都是**编译期绑定**的，
 * 同一个 Client 无法在运行时切换数据库类型
 * （实测报错：Driver Adapter @prisma/adapter-pg is not compatible with provider sqlite）。
 * 所以必须生成两套 Client，运行时按连接串选择。
 *
 * 两份文件的差异**只允许两处**：
 *   1. datasource.provider  sqlite / postgresql
 *   2. generator.output     各自独立的生成目录
 * 其它任何差异都会导致「本地跑得通、线上报错」这类难查的问题。
 *
 * 用法：
 *   node scripts/sync-schema.mjs          以 schema.prisma 为准重新生成 PG 版
 *   node scripts/sync-schema.mjs --check  只检查是否一致（CI / build 用）
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
const OUTPUT_SQLITE = 'output   = "../prisma/generated"';
const OUTPUT_PG = 'output   = "../prisma/generated-pg"';

const base = readFileSync(SQLITE, 'utf8');

for (const [needle, label] of [
  [PROVIDER_SQLITE, 'datasource provider "sqlite"'],
  [OUTPUT_SQLITE, `generator output ${OUTPUT_SQLITE}`],
]) {
  if (!base.includes(needle)) {
    console.error(`✗ schema.prisma 里找不到 ${label}`);
    process.exit(1);
  }
}

/** 由 SQLite 版派生出 PostgreSQL 版 */
function derive(src) {
  return src.replace(PROVIDER_SQLITE, PROVIDER_PG).replace(OUTPUT_SQLITE, OUTPUT_PG);
}

const expected = derive(base);

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
    console.error('  （只允许 provider 与 generator.output 不同）');
    process.exit(1);
  }
  console.log('✓ 两份 schema 一致');
  process.exit(0);
}

writeFileSync(PG, expected, 'utf8');
console.log('✓ 已由 schema.prisma 重新生成 schema.postgres.prisma');
