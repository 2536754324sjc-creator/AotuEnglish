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
  red: 'a big red apple and a red balloon side by side',
  blue: 'a blue butterfly and a blue ball side by side',
  green: 'a green leaf and a green frog side by side',
  yellow: 'a yellow banana and a yellow sun side by side',
  one: 'a single big yellow star',
  two: 'two small green apples side by side',
  three: 'three colorful balloons',
  four: 'four small blue birds',
};

/**
 * 统一画风。
 *
 * 之前用「flat vector illustration, soft sky blue background」时，
 * 模型给出的背景在白、蓝、青绿之间随机跳，一屏三张卡看起来不像一套。
 * 这里改成更硬的约束：
 * - 明确指定纯色背景（hex）
 * - 明确要求 thick dark outline + 扁平风，避免混入写实/3D
 * - 禁止阴影、渐变、文字，减少背景变量
 */
const STYLE =
  'flat vector illustration, thick dark outline, solid light blue background #cfe6f7, ' +
  'single object centered, no shadow, no gradient, no text, no watermark, children book style';

/**
 * 裁掉右下角水印区域，并统一转成正方形 JPG。
 *
 * 水印固定贴在右下角，尺寸约 150x60（1024 图上的比例）。
 * 做法：从底部裁掉一条边（水印高度 + 余量），再把上方内容居中到正方形。
 * 这样不会因为裁角而破坏主体构图。
 */
async function normalize(buf) {
  const img = sharp(buf);
  const meta = await img.metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;

  if (!CROP_WATERMARK) {
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

  const words = collectWords();
  console.log(`共发现 ${words.size} 个需要配图的词：`);
  for (const [slug] of words) console.log('  -', slug);

  if (dry) {
    console.log('\n--dry-run：不调用 API，结束。');
    return;
  }

  let provider = null;
  let key = null;
  for (const [name, p] of Object.entries(PROVIDERS)) {
    if (process.env[p.env]) {
      provider = name;
      key = process.env[p.env];
      break;
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
  console.log(`\n使用服务：${provider}`);
  console.log(`水印裁剪：${CROP_WATERMARK ? '开启（底部裁 9%）' : '关闭'}`);

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
    const subject = SUBJECT_OVERRIDES[slug] ?? `a single ${word}`;
    const fullPrompt = `${subject}, ${STYLE}`;
    try {
      const raw = await PROVIDERS[provider].gen(fullPrompt, key);
      const finalBuf = await normalize(raw);
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
