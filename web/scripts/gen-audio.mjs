#!/usr/bin/env node
/**
 * 把单词发音下载成本地 MP3，并自动更新 src/lib/speak.ts 的清单。
 *
 * 为什么要把音频落到本地：
 * - 上线后不依赖百度/有道的接口，避免对方改接口或被限流
 * - 用户听发音是零延迟的（不用等服务端代理转发）
 * - 服务端代理只作为「兜底」和「新词」的通道
 *
 * 用法：
 *   node scripts/gen-audio.mjs              # 下载缺失的
 *   node scripts/gen-audio.mjs --force      # 全部重新下载
 *   node scripts/gen-audio.mjs --dry-run    # 只列出清单
 */

import { writeFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const AUDIO_DIR = join(ROOT, 'public', 'audio');
const SPEAK_FILE = join(ROOT, 'src', 'lib', 'speak.ts');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

function toSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

/**
 * 收集要生成音频的词。
 *
 * 词源是「词库 + 图卡 + mock-words」三者的并集：
 * - 词库（gen-wordbank.mjs 的 WORD_BANK）：决定要学哪些词，是权威来源
 * - 图卡文件名：兜底，防止手放的图漏掉
 * - mock-words：有些词已进页面但还没配图（如 hello/thanks/please），也得能发音
 *
 * 早期版本只读图卡，导致「词库里有、图卡还没生成」的词永远拿不到音频。
 */
function collectWords() {
  const words = new Set();

  // 1) 词库：直接解析 gen-wordbank.mjs 里的 { word: 'xxx' }
  const wordbankFile = join(__dirname, 'gen-wordbank.mjs');
  if (existsSync(wordbankFile)) {
    const src = readFileSync(wordbankFile, 'utf8');
    for (const m of src.matchAll(/\{\s*word:\s*'([^']+)'/g)) {
      words.add(m[1].replace(/-/g, ' '));
    }
  }

  // 2) 图卡文件名兜底
  const cardsDir = join(ROOT, 'public', 'cards');
  if (existsSync(cardsDir)) {
    for (const f of readdirSync(cardsDir)) {
      if (!f.endsWith('.jpg') || f.startsWith('_')) continue;
      // 文件名里的连字符还原成空格（如 orange-fruit -> orange fruit）
      words.add(f.replace(/\.jpg$/, '').replace(/-/g, ' '));
    }
  }

  // 3) mock-words 里已展示给用户的词
  const mockWordsFile = join(ROOT, 'src', 'lib', 'mock-words.ts');
  if (existsSync(mockWordsFile)) {
    const src = readFileSync(mockWordsFile, 'utf8');
    for (const m of src.matchAll(/word:\s*'([^']+)'/g)) {
      words.add(m[1]);
    }
  }

  return [...words].sort();
}

async function fetchBaidu(text) {
  const url = `https://fanyi.baidu.com/gettts?lan=en&text=${encodeURIComponent(
    text,
  )}&spd=3&source=web`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Referer: 'https://fanyi.baidu.com/' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`baidu ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error('baidu 返回过短');
  const isMp3 = (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) || buf.subarray(0, 3).toString() === 'ID3';
  if (!isMp3) throw new Error('baidu 非 MP3');
  return buf;
}

async function fetchYoudao(text) {
  const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Referer: 'https://dict.youdao.com/' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`youdao ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) throw new Error('youdao 返回过短');
  return buf;
}

/** 把音频清单写回 speak.ts */
function updateManifest(slugs) {
  const src = readFileSync(SPEAK_FILE, 'utf8');
  const arr = slugs
    .sort()
    .map((s) => `'${s}'`)
    .join(', ');
  // 允许换行排版
  const formatted = arr.length > 80 ? '\n  ' + arr.replace(/, /g, ',\n  ') + ',\n' : arr;
  const next = src.replace(
    /const LOCAL_AUDIO: string\[\] = \[[\s\S]*?\];/,
    `const LOCAL_AUDIO: string[] = [${formatted}];`,
  );
  if (next === src) {
    console.log('⚠ 未能更新 speak.ts 的 LOCAL_AUDIO（正则未匹配）');
    return;
  }
  writeFileSync(SPEAK_FILE, next);
  console.log(`已更新 speak.ts：LOCAL_AUDIO 共 ${slugs.length} 项`);
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const dry = args.includes('--dry-run');

  const words = collectWords();
  console.log(`共 ${words.length} 个词需要音频\n`);

  if (dry) {
    console.log('--dry-run，清单：');
    for (const w of words) console.log('  -', w, '->', toSlug(w) + '.mp3');
    return;
  }

  mkdirSync(AUDIO_DIR, { recursive: true });

  let ok = 0;
  let skip = 0;
  let fail = 0;
  const done = [];

  for (const word of words) {
    const slug = toSlug(word);
    if (!slug) continue;
    const out = join(AUDIO_DIR, `${slug}.mp3`);

    if (existsSync(out) && !force) {
      skip++;
      done.push(slug);
      continue;
    }

    try {
      let buf;
      try {
        buf = await fetchBaidu(word);
      } catch (e) {
        // 百度失败换有道
        buf = await fetchYoudao(word);
      }
      writeFileSync(out, buf);
      ok++;
      done.push(slug);
      console.log(`✓ ${slug.padEnd(16)} ${Math.round(buf.length / 1024)}KB`);
    } catch (e) {
      fail++;
      console.log(`✗ ${slug.padEnd(16)} ${e.message.slice(0, 50)}`);
    }
    // 限速，避免被封
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\n下载：成功 ${ok}，跳过 ${skip}，失败 ${fail}`);
  updateManifest(done);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
