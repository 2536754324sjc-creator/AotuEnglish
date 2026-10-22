#!/usr/bin/env node
/**
 * 单张试跑脚本 —— 先用 1 次调用确认接口通、画风对，再批量生成。
 *
 * 用法：
 *   MODELSCOPE_API_KEY=xxx node scripts/test-one-image.mjs cow
 *   MODELSCOPE_API_KEY=xxx node scripts/test-one-image.mjs hello --seed=42
 *
 * 产物写到 public/cards/_test-{slug}.jpg，不覆盖正式图，
 * 确认满意后再跑 gen-card-images.mjs --force 正式生成。
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CARD_DIR = join(ROOT, 'public', 'cards');

const STYLE =
  'flat vector illustration, thick dark outline, solid light blue background #cfe6f7, ' +
  'single object centered, no shadow, no gradient, no text, no watermark, children book style';

const NEGATIVE =
  'text, letters, words, watermark, signature, logo, caption, label, ' +
  'blurry, low quality, jpeg artifacts, extra limbs, deformed, ' +
  'realistic photo, 3d render, gradient background';

const SUBJECT_OVERRIDES = {
  hello: 'a cartoon child waving hand to say hello, friendly smile',
  bye: 'a cartoon child waving goodbye, walking away',
  thanks: 'a cartoon child holding hands together in gratitude',
  please: 'a cartoon child asking politely with hands together',
  red: 'a bright red fire truck, side view',
  blue: 'a blue butterfly and a blue ball side by side',
  green: 'a green leaf and a green frog side by side',
  yellow: 'a yellow banana and a yellow sun side by side',
};

const slug = process.argv[2];
if (!slug) {
  console.error('用法：node scripts/test-one-image.mjs <word> [--seed=123]');
  process.exit(1);
}

const seedArg = process.argv.find((a) => a.startsWith('--seed='))?.split('=')[1];
const seed = seedArg !== undefined ? Number(seedArg) : undefined;

const key = process.env.MODELSCOPE_API_KEY;
if (!key) {
  console.error('请先设置 MODELSCOPE_API_KEY');
  process.exit(1);
}

const model = 'Qwen/Qwen-Image-2.1-Turbo';
const subject = SUBJECT_OVERRIDES[slug] ?? `a single ${slug}`;
const prompt = `${subject}, ${STYLE}`;

console.log('模型:', model);
console.log('词:', slug);
console.log('prompt:', prompt);
console.log('negative:', NEGATIVE.slice(0, 80) + '...');
console.log('');

const BASE = 'https://api-inference.modelscope.cn/';
const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

// 1. 提交
const submit = await fetch(`${BASE}v1/images/generations`, {
  method: 'POST',
  headers: { ...headers, 'X-ModelScope-Async-Mode': 'true' },
  body: JSON.stringify({
    model,
    prompt,
    negative_prompt: NEGATIVE,
    size: '1024x1024',
    ...(seed !== undefined ? { seed } : {}),
  }),
});
const submitText = await submit.text();
console.log('提交:', submit.status);
if (!submit.ok) {
  console.error(submitText.slice(0, 500));
  process.exit(1);
}
const taskId = JSON.parse(submitText).task_id;
console.log('task_id:', taskId);
console.log('等待生成...');

// 2. 轮询
let imageUrl = null;
for (let i = 0; i < 90; i++) {
  await new Promise((r) => setTimeout(r, 3000));
  const poll = await fetch(`${BASE}v1/tasks/${taskId}`, {
    headers: { ...headers, 'X-ModelScope-Task-Type': 'image_generation' },
  });
  if (!poll.ok) {
    if (poll.status >= 500) continue;
    console.error('查询失败', poll.status);
    process.exit(1);
  }
  const data = await poll.json();
  const status = data?.task_status;
  process.stdout.write(`  [${(i + 1) * 3}s] ${status}\n`);
  if (status === 'SUCCEED') {
    imageUrl = data?.output_images?.[0];
    break;
  }
  if (status === 'FAILED') {
    console.error('失败:', JSON.stringify(data?.errors ?? data).slice(0, 400));
    process.exit(1);
  }
}
if (!imageUrl) {
  console.error('超时');
  process.exit(1);
}

// 3. 下载并保存
const img = await fetch(imageUrl);
const buf = Buffer.from(await img.arrayBuffer());
const meta = await sharp(buf).metadata();
console.log(`下载完成: ${Math.round(buf.length / 1024)} KB, ${meta.width}x${meta.height}`);

mkdirSync(CARD_DIR, { recursive: true });
const out = join(CARD_DIR, `_test-${slug}.jpg`);
const finalBuf = await sharp(buf)
  .resize(1024, 1024, { fit: 'cover', position: 'center' })
  .jpeg({ quality: 88 })
  .toBuffer();
writeFileSync(out, finalBuf);
console.log('已保存:', out);
console.log('');
console.log('打开 public/cards/_test-' + slug + '.jpg 看效果。');
console.log('满意后跑：node scripts/gen-card-images.mjs --provider=modelscope --force');
