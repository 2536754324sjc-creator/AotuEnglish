#!/usr/bin/env node
/**
 * 批量生成「将来会用到」的图卡。
 *
 * 特点：
 * - 内置一份常见启蒙词库（按主题分组），按优先级依次生成
 * - 支持硬性时间上限（--minutes=9），到点立刻停止，不再发起新请求
 * - 已存在的图跳过，不重复消耗额度
 * - 每张图生成完立刻落盘，中途停止也不会丢已完成的
 *
 * 用法：
 *   MODELSCOPE_API_KEY=xxx node scripts/gen-wordbank.mjs --minutes=9
 *   MODELSCOPE_API_KEY=xxx node scripts/gen-wordbank.mjs --minutes=9 --dry-run
 */

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CARD_DIR = join(ROOT, 'public', 'cards');

// ---------------- 配置 ----------------

/**
 * 词库：按主题分组，组内顺序就是生成优先级。
 * 先出最常用的（动物、颜色、数字、家庭），再出场景类的。
 * 每个词配一句「画面描述」，避免抽象词生成成文字。
 */
const WORD_BANK = [
  // ===== 问候（已进 mock-words，之前缺图）=====
  { word: 'hello', subject: 'two cartoon children waving hello to each other' },
  { word: 'bye', subject: 'a cartoon child waving goodbye, suitcase beside' },
  { word: 'thanks', subject: 'a cartoon child hugging a gift, happy expression' },
  { word: 'please', subject: 'a cartoon child politely bowing with hands together' },

  // ===== 动物（最常用，孩子最先学）=====
  { word: 'cat', subject: 'an orange tabby cat sitting, side view' },
  { word: 'dog', subject: 'a brown puppy sitting, side view' },
  { word: 'bird', subject: 'a small blue bird standing, side view' },
  { word: 'fish', subject: 'an orange fish swimming, side view' },
  { word: 'duck', subject: 'a yellow duck standing, side view' },
  { word: 'horse', subject: 'a brown horse standing, side view' },
  { word: 'rabbit', subject: 'a white rabbit sitting, side view' },
  { word: 'panda', subject: 'a black and white panda sitting' },
  { word: 'lion', subject: 'a yellow lion with mane standing' },
  { word: 'tiger', subject: 'an orange tiger with stripes standing' },
  { word: 'monkey', subject: 'a brown monkey sitting' },
  { word: 'elephant', subject: 'a grey elephant standing, side view' },
  { word: 'bear', subject: 'a brown bear standing' },
  { word: 'frog', subject: 'a green frog sitting' },
  { word: 'bee', subject: 'a yellow and black bee flying' },
  { word: 'ant', subject: 'a small black ant, side view' },
  { word: 'hen', subject: 'a brown and white hen standing' },
  { word: 'goat', subject: 'a white goat standing' },
  { word: 'mouse', subject: 'a small grey mouse standing' },
  { word: 'snake', subject: 'a green snake coiled' },

  // ===== 颜色（用物体表达颜色）=====
  { word: 'blue', subject: 'a blue butterfly and a blue ball side by side' },
  { word: 'green', subject: 'a green leaf and a green frog side by side' },
  { word: 'yellow', subject: 'a yellow banana and a yellow sun side by side' },
  { word: 'black', subject: 'a black cat and a black hat side by side' },
  { word: 'white', subject: 'a white cloud and a white rabbit side by side' },
  { word: 'pink', subject: 'a pink flower and a pink balloon side by side' },
  { word: 'orange', subject: 'an orange carrot and an orange basketball side by side' },
  { word: 'purple', subject: 'a purple grape bunch and a purple flower side by side' },
  { word: 'brown', subject: 'a brown bear and a brown wooden box side by side' },

  // ===== 数字（用数量表达）=====
  { word: 'one', subject: 'a single big yellow star' },
  { word: 'two', subject: 'two small green apples side by side' },
  { word: 'three', subject: 'three colorful balloons' },
  { word: 'four', subject: 'four small blue birds' },
  { word: 'five', subject: 'five small red flowers' },
  { word: 'six', subject: 'six small yellow stars' },
  { word: 'seven', subject: 'seven small green leaves' },
  { word: 'eight', subject: 'eight small orange circles' },
  { word: 'nine', subject: 'nine small purple dots' },
  { word: 'ten', subject: 'ten small blue balls' },

  // ===== 家庭 =====
  { word: 'mom', subject: 'a cartoon mother smiling, standing' },
  { word: 'dad', subject: 'a cartoon father smiling, standing' },
  { word: 'baby', subject: 'a cartoon baby crawling' },
  { word: 'sister', subject: 'a cartoon girl smiling, standing' },
  { word: 'brother', subject: 'a cartoon boy smiling, standing' },
  { word: 'grandma', subject: 'a cartoon grandmother smiling, standing' },
  { word: 'grandpa', subject: 'a cartoon grandfather smiling, standing' },
  { word: 'family', subject: 'a cartoon family of four standing together' },

  // ===== 食物 =====
  { word: 'bread', subject: 'a loaf of bread, side view' },
  { word: 'milk', subject: 'a glass of milk' },
  { word: 'egg', subject: 'a white egg' },
  { word: 'rice', subject: 'a bowl of white rice' },
  { word: 'banana', subject: 'a yellow banana' },
  { word: 'orange-fruit', subject: 'an orange fruit with leaf' },
  { word: 'cake', subject: 'a slice of strawberry cake' },
  { word: 'water', subject: 'a glass of water' },
  { word: 'juice', subject: 'a glass of orange juice' },
  { word: 'noodles', subject: 'a bowl of noodles' },

  // ===== 身体 =====
  { word: 'hand', subject: 'a cartoon open hand, palm facing viewer' },
  { word: 'foot', subject: 'a cartoon foot, side view' },
  { word: 'eye', subject: 'a cartoon eye, front view' },
  { word: 'ear', subject: 'a cartoon ear, front view' },
  { word: 'nose', subject: 'a cartoon nose, front view' },
  { word: 'mouth', subject: 'a cartoon smiling mouth' },
  { word: 'head', subject: 'a cartoon child head, front view' },
  { word: 'hair', subject: 'a cartoon head with brown hair' },

  // ===== 日常用品 =====
  { word: 'book', subject: 'a closed book, side view' },
  { word: 'bag', subject: 'a school backpack' },
  { word: 'cup', subject: 'a blue cup' },
  { word: 'spoon', subject: 'a silver spoon' },
  { word: 'bed', subject: 'a simple bed, side view' },
  { word: 'door', subject: 'a wooden door, front view' },
  { word: 'window', subject: 'a window with blue frame' },
  { word: 'clock', subject: 'a round wall clock' },
  { word: 'key', subject: 'a golden key' },
  { word: 'ball', subject: 'a colorful beach ball' },

  // ===== 交通工具 =====
  { word: 'bus', subject: 'a yellow school bus, side view' },
  { word: 'bike', subject: 'a red bicycle, side view' },
  { word: 'train', subject: 'a blue train, side view' },
  { word: 'plane', subject: 'a white airplane, side view' },
  { word: 'boat', subject: 'a small sailboat on water' },
  { word: 'truck', subject: 'a green truck, side view' },

  // ===== 天气与自然 =====
  { word: 'sun', subject: 'a bright yellow sun with rays' },
  { word: 'moon', subject: 'a crescent moon at night' },
  { word: 'star', subject: 'a single yellow star' },
  { word: 'rain', subject: 'rain drops falling from a cloud' },
  { word: 'snow', subject: 'a white snowflake' },
  { word: 'cloud', subject: 'a fluffy white cloud' },
  { word: 'tree', subject: 'a green tree, full view' },
  { word: 'flower', subject: 'a pink flower with green stem' },
  { word: 'grass', subject: 'a patch of green grass' },
  { word: 'wind', subject: 'a cartoon wind blowing leaves' },

  // ===== 动作（用人物表达）=====
  { word: 'run', subject: 'a cartoon child running' },
  { word: 'jump', subject: 'a cartoon child jumping' },
  { word: 'sit', subject: 'a cartoon child sitting on a chair' },
  { word: 'eat', subject: 'a cartoon child eating with a spoon' },
  { word: 'drink', subject: 'a cartoon child drinking from a cup' },
  { word: 'sleep', subject: 'a cartoon child sleeping in bed' },
  { word: 'walk', subject: 'a cartoon child walking' },
  { word: 'read', subject: 'a cartoon child reading a book' },
  { word: 'write', subject: 'a cartoon child writing with a pencil' },
  { word: 'sing', subject: 'a cartoon child singing with music notes' },
];

/**
 * 画风：与已有 10 张保持一致。
 * 关键：主体自然色 + 浅蓝背景分开描述，避免染色。
 */
const STYLE =
  'flat vector illustration, thick dark outline, cute cartoon style, ' +
  'subject in its natural true colors, on a plain pale blue background, ' +
  'single subject centered, no shadow, no gradient, no text, no watermark';

/** 负向提示词：从源头排除文字与水印 */
const NEGATIVE =
  'text, letters, words, watermark, signature, logo, caption, label, ' +
  'blurry, low quality, jpeg artifacts, extra limbs, deformed, ' +
  'realistic photo, 3d render, gradient background, multiple subjects';

// ---------------- 生成 ----------------

const BASE = 'https://api-inference.modelscope.cn/';
const MODEL = 'Qwen/Qwen-Image-2.1-Turbo';

function wordToSlug(w) {
  return w
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

async function genOne(subject, key) {
  const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const prompt = `${subject}, ${STYLE}`;

  const submit = await fetch(`${BASE}v1/images/generations`, {
    method: 'POST',
    headers: { ...headers, 'X-ModelScope-Async-Mode': 'true' },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      negative_prompt: NEGATIVE,
      size: '1024x1024',
    }),
  });
  if (!submit.ok) {
    throw new Error(`提交失败 ${submit.status}: ${(await submit.text()).slice(0, 160)}`);
  }
  const taskId = (await submit.json()).task_id;
  if (!taskId) throw new Error('未返回 task_id');

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    const poll = await fetch(`${BASE}v1/tasks/${taskId}`, {
      headers: { ...headers, 'X-ModelScope-Task-Type': 'image_generation' },
    });
    if (!poll.ok) {
      if (poll.status >= 500) continue;
      throw new Error(`查询失败 ${poll.status}`);
    }
    const data = await poll.json();
    const st = data?.task_status;
    if (st === 'SUCCEED') {
      const url = data?.output_images?.[0];
      if (!url) throw new Error('无图片地址');
      const img = await fetch(url);
      if (!img.ok) throw new Error(`下载失败 ${img.status}`);
      return Buffer.from(await img.arrayBuffer());
    }
    if (st === 'FAILED') throw new Error('任务失败');
  }
  throw new Error('超时');
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry-run');
  const minutesArg = args.find((a) => a.startsWith('--minutes='))?.split('=')[1];
  const minutes = minutesArg ? Number(minutesArg) : 9;

  const key = process.env.MODELSCOPE_API_KEY;
  if (!key && !dry) {
    console.error('请先设置 MODELSCOPE_API_KEY');
    process.exit(1);
  }

  // 过滤已存在的
  const pending = WORD_BANK.filter(({ word }) => {
    const slug = wordToSlug(word);
    return !existsSync(join(CARD_DIR, `${slug}.jpg`));
  });

  console.log(`词库共 ${WORD_BANK.length} 个词，已存在 ${WORD_BANK.length - pending.length} 个`);
  console.log(`待生成 ${pending.length} 个`);
  console.log(`时间上限 ${minutes} 分钟\n`);

  if (dry) {
    console.log('--dry-run，只列出待生成清单：');
    for (const { word } of pending) console.log('  -', word);
    return;
  }

  mkdirSync(CARD_DIR, { recursive: true });

  const deadline = Date.now() + minutes * 60 * 1000;
  let ok = 0;
  let fail = 0;
  let stopped = false;

  for (const { word, subject } of pending) {
    // 硬性时间检查：到点立刻停，不再发起新请求
    if (Date.now() >= deadline) {
      stopped = true;
      console.log('\n⏰ 已到时间上限，停止生成');
      break;
    }

    const slug = wordToSlug(word);
    const out = join(CARD_DIR, `${slug}.jpg`);
    const remain = Math.round((deadline - Date.now()) / 1000);

    try {
      const raw = await genOne(subject, key);
      const finalBuf = await sharp(raw)
        .resize(1024, 1024, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 88 })
        .toBuffer();
      writeFileSync(out, finalBuf);
      ok++;
      console.log(`✓ ${slug.padEnd(16)} ${Math.round(finalBuf.length / 1024)}KB  剩余 ${remain}s`);
    } catch (e) {
      fail++;
      console.log(`✗ ${slug.padEnd(16)} ${e.message.slice(0, 60)}  剩余 ${remain}s`);
    }
  }

  const total = WORD_BANK.filter(({ word }) =>
    existsSync(join(CARD_DIR, `${wordToSlug(word)}.jpg`)),
  ).length;

  console.log(`\n本次：成功 ${ok}，失败 ${fail}${stopped ? '（因超时提前停止）' : ''}`);
  console.log(`图卡总计：${total} 张`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
