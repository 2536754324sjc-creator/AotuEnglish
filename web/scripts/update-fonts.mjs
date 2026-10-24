#!/usr/bin/env node
/**
 * 一键更新字体子集：统计字符 -> 生成子集 -> 校验缺字。
 *
 * 为什么要一条命令：
 * 原来要依次跑三个脚本，容易漏掉其中一步（尤其漏了 subset 只跑 check 会误报）。
 * 这里把三步串起来，任何一步失败就中断并说明原因。
 *
 * 用法：
 *   npm run fonts          # 常规：字符有变化才重建
 *   npm run fonts -- --force  # 强制重建（改了字体配置时用）
 *
 * 说明：缺字不会导致豆腐块，浏览器会回退系统字体（只是字形略不统一）。
 * 所以这个命令不需要在每次改文案后立刻跑，可以攒一批一起跑。
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CHARS_FILE = join(__dirname, '.chars.txt');
const HASH_FILE = join(__dirname, '.chars.hash');

const force = process.argv.includes('--force');

function run(cmd, args, label) {
  process.stdout.write(`\n[${label}] `);
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', shell: false });
  if (r.status !== 0) {
    console.error(`\n✗ ${label} 失败`);
    process.exit(r.status ?? 1);
  }
}

/** 简易内容指纹，用来判断字符集有没有变化 */
function fingerprint(text) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  }
  return `${h.toString(16)}-${text.length}`;
}

function main() {
  const python = process.platform === 'win32' ? 'python' : 'python3';

  // 1. 统计字符
  run(process.execPath, [join(__dirname, 'collect-chars.mjs')], '1/3 统计字符');

  const chars = readFileSync(CHARS_FILE, 'utf8');
  const fp = fingerprint(chars);

  // 2. 字符没变就跳过重建（除非 --force）
  if (!force && existsSync(HASH_FILE) && readFileSync(HASH_FILE, 'utf8').trim() === fp) {
    console.log(`\n字符集未变化（${fp}），跳过字体重建。`);
    console.log('如需强制重建：npm run fonts -- --force');
  } else {
    run(python, [join(__dirname, 'subset-fonts.py')], '2/3 生成子集字体');
    writeFileSync(HASH_FILE, fp);
  }

  // 3. 校验零缺字
  run(python, [join(__dirname, 'check-fonts.py')], '3/3 校验覆盖');

  console.log('\n✓ 字体子集已就绪。');
}

main();
