#!/usr/bin/env node
/**
 * 构建前自动维护字体子集。
 *
 * 目标：**你不需要记住任何字体命令**。
 *
 * 行为：
 * - 字符集没变 → 什么都不做，秒过
 * - 字符集变了 → 自动重建子集 + 校验，然后继续构建
 * - 重建失败 → 只警告，不阻断构建
 *
 * 为什么不阻断：
 * 缺字不会导致豆腐块（浏览器会回退系统字体），只是一个纯视觉的统一性问题。
 * 为了它挡住整个发布流程不值得。
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CHARS_FILE = join(__dirname, '.chars.txt');
const HASH_FILE = join(__dirname, '.chars.hash');

function fingerprint(text) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  }
  return `${h.toString(16)}-${text.length}`;
}

function main() {
  // 1. 统计当前源码字符
  const collect = spawnSync(process.execPath, [join(__dirname, 'collect-chars.mjs')], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  if (collect.status !== 0 || !existsSync(CHARS_FILE)) {
    console.log('⚠ 字符统计失败，跳过字体维护');
    return;
  }

  const chars = readFileSync(CHARS_FILE, 'utf8');
  const fp = fingerprint(chars);
  const saved = existsSync(HASH_FILE) ? readFileSync(HASH_FILE, 'utf8').trim() : '';

  if (fp === saved) {
    console.log('✓ 字体子集已是最新');
    return;
  }

  // 2. 字符集变了：自动重建
  console.log('ℹ 检测到文案变化，正在重建字体子集…');
  const python = process.platform === 'win32' ? 'python' : 'python3';
  const subset = spawnSync(python, [join(__dirname, 'subset-fonts.py')], {
    cwd: ROOT,
    encoding: 'utf8',
  });

  if (subset.status !== 0) {
    console.log('⚠ 字体重建失败，继续构建（页面仍可正常显示，只是新字用系统字体）');
    return;
  }

  const verify = spawnSync(python, [join(__dirname, 'check-fonts.py')], {
    cwd: ROOT,
    encoding: 'utf8',
  });

  if (verify.status === 0) {
    // 必须写 hash：否则下次仍判定「有变化」，会无谓重建；
    // 更糟的是如果漏写，恢复文案后无法判断字体里是否还含旧字。
    writeFileSync(HASH_FILE, fp);
    console.log('✓ 字体子集已自动更新');
  } else {
    console.log('⚠ 字体重建后仍有缺字，请检查 scripts/subset-fonts.py');
  }
}

main();
