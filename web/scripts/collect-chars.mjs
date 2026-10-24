#!/usr/bin/env node
/**
 * 扫描源码，统计站内实际用到的所有字符，作为字体子集化的输入。
 *
 * 为什么要扫源码而不是用现成的常用字表：
 * 子集只该包含「真的会显示的字」。用 3500 常用字会白白多带几千个字符，
 * 而本项目文案量不大，精确统计能压到最小。
 *
 * 同时必须收录：
 * - 英文/数字/标点（正文里混排）
 * - 项目里的中文文案（页面、i18n、mock 数据）
 * - 词库里的 114 个英文单词
 *
 * 用法：node scripts/collect-chars.mjs
 * 输出：scripts/.chars.txt（供 pyftsubset 使用）
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');

/** 递归收集文件 */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      walk(p, out);
    } else if (['.ts', '.tsx', '.css', '.json'].includes(extname(name))) {
      out.push(p);
    }
  }
  return out;
}

/** 从 TS/TSX 源码里抽出可能显示给用户的文本 */
function extractDisplayText(code) {
  const chunks = [];

  // 1. 所有字符串字面量（单引号、双引号、反引号）
  for (const m of code.matchAll(/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"|`([^`\\]|\\.)*`/g)) {
    chunks.push(m[0].slice(1, -1));
  }
  // 2. JSX 文本节点：>文本<
  for (const m of code.matchAll(/>([^<>{}]{1,200})</g)) {
    chunks.push(m[1]);
  }
  return chunks.join('\n');
}

function main() {
  const files = walk(SRC);
  let all = '';

  for (const f of files) {
    all += '\n' + extractDisplayText(readFileSync(f, 'utf8'));
  }

  // 补充：必须包含的基础字符集
  // - ASCII 可见字符（英文、数字、标点）
  let ascii = '';
  for (let c = 0x20; c <= 0x7e; c++) ascii += String.fromCharCode(c);
  all += ascii;

  // - 常用中文标点与符号
  all += '　、。〃々〈〉《》「」『』【】〔〕〖〗〝〞～·—…‰′″℃￥';
  all += '！＂＃＄％＆（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝';
  all += '“”‘’–—…•·°′″€£¥©®™←→↑↓✓✕';

  // 去重 + 排序，保证输出稳定（便于 diff）
  const chars = [...new Set([...all])].filter((c) => {
    const cp = c.codePointAt(0);
    // 排除控制字符与零宽字符
    return cp >= 0x20 && cp !== 0x7f && !(cp >= 0x200b && cp <= 0x200f) && cp !== 0xfeff;
  });

  chars.sort((a, b) => a.codePointAt(0) - b.codePointAt(0));

  const han = chars.filter((c) => /[\u4e00-\u9fff]/.test(c));
  const latin = chars.filter((c) => /[A-Za-z]/.test(c));
  const punct = chars.filter((c) => !/[\u4e00-\u9fffA-Za-z0-9]/.test(c));

  const out = join(__dirname, '.chars.txt');
  writeFileSync(out, chars.join(''), 'utf8');

  console.log(`扫描 ${files.length} 个源文件`);
  console.log(`总字符数：${chars.length}`);
  console.log(`  汉字：${han.length}`);
  console.log(`  拉丁字母：${latin.length}`);
  console.log(`  数字：${chars.filter((c) => /[0-9]/.test(c)).length}`);
  console.log(`  标点/符号：${punct.length}`);
  console.log(`\n已写入 ${out}`);
  console.log(`\n汉字示例：${han.slice(0, 60).join('')}`);
}

main();
