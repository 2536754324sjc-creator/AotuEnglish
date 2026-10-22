#!/usr/bin/env node
/**
 * 图卡批量生图脚本
 *
 * 用法：
 *   node scripts/gen-card-images.mjs --dry-run     # 只列出会生成什么，不调 API
 *   node scripts/gen-card-images.mjs               # 生成本地缺失的图
 *   node scripts/gen-card-images.mjs --force       # 全部重新生成
 *
 * 密钥（任选其一，从环境变量读取，不写进仓库）：
 *   ZHIPU_API_KEY      智谱 CogView
 *   DASHSCOPE_API_KEY  通义万相
 *   OPENAI_API_KEY     OpenAI gpt-image-1
 *
 * 产出：web/public/cards/{word}.jpg
 *
 * 关于水印：
 * 智谱的免费模型 cogview-3-flash 会在右下角强制打「AI生成」水印。
 * 本脚本会在保存前裁掉右下角一块区域，避开这个水印。
 * 如果换成无水印的付费模型，把 CROP_WATERMARK 设为 false 即可。
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CARD_DIR = join(ROOT, 'public', 'cards');

/** 是否裁掉右下角水印。换付费模型后改 false。 */
const CROP_WATERMARK = !process.argv.includes('--no-crop');

/** 与前端 card-images.ts 保持一致的命名规则 */
function wordToSlug(word) {
  return word
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

/**
 * "a cartoon cow, ..." -> "cow"；"greeting hello, ..." -> "hello"
 * 取第一个逗号前、剥掉冠词与画风词、取最后一个实词。
 */
function promptToSlug(source) {
  const head = (source || '').split(',')[0] ?? '';
  const words = head
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter(
      (w) => !['a', 'an', 'the', 'cartoon', 'illustration', 'flat', 'vector', 'simple'].includes(w),
    );
  if (words.length === 0) return '';
  return wordToSlug(words[words.length - 1]);
}

/** 收集所有需要配图的词 */
function collectWords() {
  const words = new Map();
  const libDir = join(ROOT, 'src', 'lib');

  const jsonFiles = readdirSync(libDir).filter(
    (f) => f.startsWith('sample-ou-') && f.endsWith('.json'),
  );
  for (const f of jsonFiles) {
    const data = JSON.parse(readFileSync(join(libDir, f), 'utf8'));
    for (const unit of data.units ?? []) {
      for (const q of unit.questions ?? []) {
        for (const opt of q.options ?? []) {
          if (!opt.imagePrompt) continue;
          const slug = promptToSlug(opt.imagePrompt);
          if (slug && !words.has(slug)) {
            words.set(slug, { word: slug.replace(/-/g, ' '), prompt: opt.imagePrompt });
          }
        }
      }
    }
  }

  const reviewSrc = join(libDir, 'mock-review.ts');
  if (existsSync(reviewSrc)) {
    const text = readFileSync(reviewSrc, 'utf8');
    const re = /imagePrompt:\s*'([^']+)'/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const slug = promptToSlug(m[1]);
      if (slug && !words.has(slug)) {
        words.set(slug, { word: slug.replace(/-/g, ' '), prompt: m[1] });
      }
    }
  }

  return words;
}

/**
 * 部分词需要专门的画面描述。
 *
 * 抽象词（hello / red）直接丢给模型只会画成文字——
 * 而「听音选图」里把单词写在图上，等于直接把答案告诉孩子，图就失去意义了。
 * 这里给它们换成「可见的场景」：hello 画成挥手打招呼，red 画成红色物体。
 */
const SUBJECT_OVERRIDES = {
  hello: 'a cartoon child waving hand to say hello, friendly smile',
  bye: 'a cartoon child waving goodbye, walking away',
  thanks: 'a cartoon child holding hands together in gratitude',
  please: 'a cartoon child asking politely with hands together',
  red: 'a bright red fire truck, side view',
  blue: 'a blue butterfly and a blue ball side by side',
  green: 'a green leaf and a green frog side by side',
  yellow: 'a yellow banana and a yellow sun side by side',
  one: 'a single big yellow star',
  two: 'two small green apples side by side',
  three: 'three colorful balloons',
  four: 'four small blue birds',
};

/**
 * 主体的自然色。
 *
 * 踩过的坑：如果只写 "a single cow" + "solid light blue background"，
 * 模型会把背景的蓝色染到主体上，生成一头蓝色的牛。
 * 这里把每种东西的自然颜色写清楚。
 */
const COLOR_HINTS = {
  cow: 'a black and white dairy cow',
  pig: 'a pink pig',
  sheep: 'a white fluffy sheep',
  duck: 'a yellow duck',
  horse: 'a brown horse',
  hen: 'a brown and white hen',
  cat: 'an orange tabby cat',
  dog: 'a brown dog',
  bird: 'a small blue bird',
  fish: 'an orange fish',
  apple: 'a red apple',
  car: 'a blue car',
  table: 'a wooden brown table',
  chair: 'a wooden brown chair',
  pencil: 'a yellow pencil',
};

/**
 * 统一画风。
 *
 * 关键点（都是踩坑换来的）：
 * - 不要把 hex 背景色和主体写在同一句里，否则颜色会串到主体上
 * - 明确要求「主体用自然色」「背景是浅蓝」两件事分开说
 * - 禁止阴影/渐变/文字/水印，减少背景变量
 */
const STYLE =
  'flat vector illustration, thick dark outline, cute cartoon style, ' +
  'subject in its natural true colors, on a plain pale blue background, ' +
  'single subject centered, no shadow, no gradient, no text, no watermark';

/**
 * 裁掉右下角水印区域，并统一转成正方形 JPG。
 *
 * 水印固定贴在右下角，尺寸约 150x60（1024 图上的比例）。
 * 做法：从底部裁掉一条边（水印高度 + 余量），再把上方内容居中到正方形。
 * 这样不会因为裁角而破坏主体构图。
 */
async function normalize(buf, cropWatermark = CROP_WATERMARK) {
  const img = sharp(buf);
  const meta = await img.metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;

  if (!cropWatermark) {
    return sharp(buf)
      .resize(1024, 1024, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 88 })
      .toBuffer();
  }

  // 底部裁掉约 9%（水印 + 安全余量），保留上方正方形区域
  const cropH = Math.round(h * 0.91);
  const square = Math.min(w, cropH);

  return sharp(buf)
    .extract({
      left: Math.round((w - square) / 2),
      top: Math.round((cropH - square) / 2),
      width: square,
      height: square,
    })
    .resize(1024, 1024, { fit: 'cover' })
    .jpeg({ quality: 88 })
    .toBuffer();
}

const PROVIDERS = {
  /**
   * 魔搭 ModelScope API-Inference。
   *
   * 与其它两家的最大区别是「异步任务制」：
   *   1. POST /v1/images/generations 带上 X-ModelScope-Async-Mode: true，拿到 task_id
   *   2. GET /v1/tasks/{task_id} 带上 X-ModelScope-Task-Type: image_generation 轮询
   *      直到 task_status === 'SUCCEED'，output_images[0] 才是图片地址
   *
   * 优势：支持 negative_prompt，可以在生成阶段就排除文字与水印，
   * 不用像智谱那样事后裁图。
   *
   * 前提：账号需绑定阿里云并完成实名认证，否则 API-Inference 不可用。
   */
  modelscope: {
    env: 'MODELSCOPE_API_KEY',
    /** 生成阶段就排除文字/水印，比事后裁剪干净 */
    negativePrompt:
      'text, letters, words, watermark, signature, logo, caption, label, ' +
      'blurry, low quality, jpeg artifacts, extra limbs, deformed, ' +
      'realistic photo, 3d render, gradient background',
    async gen(prompt, key, opts = {}) {
      const BASE = 'https://api-inference.modelscope.cn/';
      const model = opts.model ?? 'Qwen/Qwen-Image-2.1-Turbo';
      const headers = {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      };

      // 1. 提交任务
      const submit = await fetch(`${BASE}v1/images/generations`, {
        method: 'POST',
        headers: { ...headers, 'X-ModelScope-Async-Mode': 'true' },
        body: JSON.stringify({
          model,
          prompt,
          negative_prompt: this.negativePrompt,
          size: '1024x1024',
          // 固定种子便于复现；如需随机可去掉
          ...(opts.seed !== undefined ? { seed: opts.seed } : {}),
        }),
      });

      const submitText = await submit.text();
      if (!submit.ok) {
        throw new Error(`modelscope 提交失败 ${submit.status}: ${submitText.slice(0, 240)}`);
      }
      let submitJson;
      try {
        submitJson = JSON.parse(submitText);
      } catch {
        throw new Error(`modelscope 返回非 JSON: ${submitText.slice(0, 200)}`);
      }
      const taskId = submitJson?.task_id;
      if (!taskId) {
        throw new Error(`modelscope 未返回 task_id: ${submitText.slice(0, 200)}`);
      }

      // 2. 轮询结果（Qwen-Image 一般 10-40 秒）
      for (let i = 0; i < 90; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const poll = await fetch(`${BASE}v1/tasks/${taskId}`, {
          headers: { ...headers, 'X-ModelScope-Task-Type': 'image_generation' },
        });
        if (!poll.ok) {
          // 轮询偶发 5xx 不算失败，继续试
          if (poll.status >= 500) continue;
          throw new Error(`modelscope 查询失败 ${poll.status}`);
        }
        const data = await poll.json();
        const status = data?.task_status;

        if (status === 'SUCCEED') {
          const url = data?.output_images?.[0];
          if (!url) throw new Error('modelscope 成功但无图片地址');
          const img = await fetch(url);
          if (!img.ok) throw new Error(`下载图片失败 ${img.status}`);
          return Buffer.from(await img.arrayBuffer());
        }
        if (status === 'FAILED') {
          throw new Error(
            `modelscope 任务失败: ${JSON.stringify(data?.errors ?? data).slice(0, 200)}`,
          );
        }
        // PENDING / RUNNING 继续等
      }
      throw new Error('modelscope 任务超时（约 4.5 分钟）');
    },
  },

  zhipu: {
    env: 'ZHIPU_API_KEY',
    async gen(prompt, key) {
      const res = await fetch('https://open.bigmodel.cn/api/paas/v4/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: 'cogview-3-flash', prompt, size: '1024x1024' }),
      });
      if (!res.ok) throw new Error(`zhipu ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const json = await res.json();
      const url = json?.data?.[0]?.url;
      if (!url) throw new Error('zhipu 未返回图片地址');
      const img = await fetch(url);
      return Buffer.from(await img.arrayBuffer());
    },
  },
  dashscope: {
    env: 'DASHSCOPE_API_KEY',
    async gen(prompt, key) {
      const res = await fetch(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
            'X-DashScope-Async': 'enable',
          },
          body: JSON.stringify({
            model: 'wanx2.1-t2i-turbo',
            input: { prompt },
            parameters: { size: '1024*1024', n: 1 },
          }),
        },
      );
      if (!res.ok) throw new Error(`dashscope ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const json = await res.json();
      const taskId = json?.output?.task_id;
      if (!taskId) throw new Error('dashscope 未返回 task_id');

      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const q = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${key}` },
        });
        const qj = await q.json();
        const status = qj?.output?.task_status;
        if (status === 'SUCCEEDED') {
          const url = qj?.output?.results?.[0]?.url;
          if (!url) throw new Error('dashscope 无结果地址');
          const img = await fetch(url);
          return Buffer.from(await img.arrayBuffer());
        }
        if (status === 'FAILED') throw new Error('dashscope 任务失败');
      }
      throw new Error('dashscope 任务超时');
    },
  },
  openai: {
    env: 'OPENAI_API_KEY',
    async gen(prompt, key) {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: 'gpt-image-1', prompt, size: '1024x1024', n: 1 }),
      });
      if (!res.ok) throw new Error(`openai ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const json = await res.json();
      const b64 = json?.data?.[0]?.b64_json;
      if (!b64) throw new Error('openai 未返回图片数据');
      return Buffer.from(b64, 'base64');
    },
  },
};

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const dry = args.includes('--dry-run');

  /** --provider=modelscope  指定服务，否则按环境变量自动挑 */
  const providerArg = args.find((a) => a.startsWith('--provider='))?.split('=')[1];
  /** --model=Qwen/Qwen-Image-2.1-Turbo */
  const modelArg = args.find((a) => a.startsWith('--model='))?.split('=')[1];
  /** --seed=12345  固定种子，便于复现同一张图 */
  const seedArgRaw = args.find((a) => a.startsWith('--seed='))?.split('=')[1];
  const seedArg = seedArgRaw !== undefined ? Number(seedArgRaw) : undefined;

  const words = collectWords();
  console.log(`共发现 ${words.size} 个需要配图的词：`);
  for (const [slug] of words) console.log('  -', slug);

  if (dry) {
    console.log('\n--dry-run：不调用 API，结束。');
    return;
  }

  let provider = null;
  let key = null;
  if (providerArg) {
    const p = PROVIDERS[providerArg];
    if (!p) {
      console.error(`未知服务：${providerArg}。可选：${Object.keys(PROVIDERS).join(' / ')}`);
      process.exit(1);
    }
    if (!process.env[p.env]) {
      console.error(`指定了 ${providerArg}，但环境变量 ${p.env} 未设置。`);
      process.exit(1);
    }
    provider = providerArg;
    key = process.env[p.env];
  } else {
    for (const [name, p] of Object.entries(PROVIDERS)) {
      if (process.env[p.env]) {
        provider = name;
        key = process.env[p.env];
        break;
      }
    }
  }
  if (!provider) {
    console.error(
      '\n未找到生图密钥。请设置以下任一环境变量后重试：\n' +
        Object.values(PROVIDERS)
          .map((p) => '  ' + p.env)
          .join('\n'),
    );
    process.exit(1);
  }

  // ModelScope 用 negative_prompt 在生成阶段就排除水印，不需要事后裁剪。
  // 其它家（如智谱免费模型）仍需裁掉右下角水印。
  const needsCrop = CROP_WATERMARK && provider !== 'modelscope';

  console.log(`\n使用服务：${provider}`);
  if (provider === 'modelscope') {
    console.log(`模型：${modelArg ?? 'Qwen/Qwen-Image-2.1-Turbo'}`);
    console.log('水印处理：negative_prompt 排除（无需裁剪）');
  } else {
    console.log(`水印裁剪：${needsCrop ? '开启（底部裁 9%）' : '关闭'}`);
  }

  mkdirSync(CARD_DIR, { recursive: true });

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const [slug, { word }] of words) {
    const out = join(CARD_DIR, `${slug}.jpg`);
    if (existsSync(out) && !force) {
      console.log(`跳过 ${slug}（已存在）`);
      skip++;
      continue;
    }
    const subject =
      COLOR_HINTS[slug] ?? SUBJECT_OVERRIDES[slug] ?? `a single ${word}`;
    const fullPrompt = `${subject}, ${STYLE}`;
    try {
      const raw = await PROVIDERS[provider].gen(fullPrompt, key, {
        model: modelArg,
        seed: seedArg,
      });
      const finalBuf = await normalize(raw, needsCrop);
      writeFileSync(out, finalBuf);
      console.log(`✓ ${slug}  (${Math.round(finalBuf.length / 1024)} KB)`);
      ok++;
    } catch (e) {
      console.error(`✗ ${slug}: ${e.message}`);
      fail++;
    }
    // 限速，避免被服务端拒绝
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`\n完成：成功 ${ok}，跳过 ${skip}，失败 ${fail}`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
