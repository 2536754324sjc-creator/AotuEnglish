#!/usr/bin/env node
/**
 * 校验 mock-readings.ts 里的插图 slug 是否都有真实图卡。
 *
 * 为什么需要：读本的 `img` 字段是字符串，写错了 tsc 发现不了，
 * 只会在运行时变成一张 404 的破图。
 *
 * 用法：
 *   node scripts/check-readings.mjs
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CARD_DIR = join(ROOT, 'public', 'cards');
const SRC = join(ROOT, 'src', 'lib', 'mock-readings.ts');

const cards = new Set(
  existsSync(CARD_DIR)
    ? readdirSync(CARD_DIR)
        .filter((f) => f.endsWith('.jpg'))
        .map((f) => f.replace(/\.jpg$/, ''))
    : [],
);

const src = readFileSync(SRC, 'utf8');

// 抓 p('slug', ...) 里的第一个参数
const used = [...src.matchAll(/\bp\(\s*'([^']+)'/g)].map((m) => m[1]);
// 封面字段 cover: 'slug'
const covers = [...src.matchAll(/\bcover:\s*'([^']+)'/g)].map((m) => m[1]);
const all = [...new Set([...used, ...covers])];
const missing = all.filter((s) => !cards.has(s));

console.log(`图卡总数：${cards.size}`);
console.log(`读本引用：${used.length} 处内页 + ${covers.length} 个封面，去重后 ${all.length} 个`);

if (missing.length) {
  console.log(`\n✗ 缺少图卡（${missing.length}）：`);
  for (const m of missing) console.log(`  - ${m}`);
  process.exit(1);
}
console.log('\n✓ 所有插图都有对应图卡');
