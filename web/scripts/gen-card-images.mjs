#!/usr/bin/env node
/**
 * 图卡批量生图脚本
 *
 * 用法：
 *   node scripts/gen-card-images.mjs                 # 生成缺失的图
 *   node scripts/gen-card-images.mjs --force         # 全部重新生成
 *   node scripts/gen-card-images.mjs --dry-run       # 只列出会生成什么，不调 API
 *
 * 密钥（任选其一，从环境变量读取，不写进仓库）：
 *   ZHIPU_API_KEY      智谱 CogView
 *   DASHSCOPE_API_KEY  通义万相
 *   OPENAI_API_KEY     OpenAI gpt-image-1
 *
 * 产出：web/public/cards/{word}.webp
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CARD_DIR = join(ROOT, 'public', 'cards');

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
 * 与前端 card-images.ts 保持一致的命名规则。
 * "a cartoon cow, ..." -> "cow"；"greeting hello, ..." -> "hello"（取最后一个实词）
 */
function promptToSlug(source) {
  const head = (source || '').split(',')[0] ?? '';
  const words = head
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !['a', 'an', 'the', 'cartoon', 'illustration', 'flat', 'vector', 'simple'].includes(w));
  if (words.length === 0) return '';
  return wordToSlug(words[words.length - 1]);
}

/**
 * 从样例数据里收集所有需要图的词。
 * 覆盖 sample-ou-*.json 与 mock-review.ts 里出现的 imagePrompt，
 * 保证「页面上真实会出现的卡」都有图。
 */
function collectWords() {
  const words = new Map(); // slug -> { word, prompt }

  const jsonFiles = readdirSync(join(ROOT, 'src', 'lib')).filter((f) => f.startsWith('sample-ou-') && f.endsWith('.json'));
  for (const f of jsonFiles) {
    const data = JSON.parse(readFileSync(join(ROOT, 'src', 'lib', f), 'utf8'));
    const units = data.units ?? [];
    for (const unit of units) {
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

  // 复习页里的图卡
  const reviewSrc = join(ROOT, 'src', 'lib', 'mock-review.ts');
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

/** 统一画风前缀：所有图共享，保证一屏里看起来是一套 */
const STYLE = 'flat vector illustration, soft sky blue background, centered, child-friendly, no text';

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

      // 轮询任务
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

  mkdirSync(CARD_DIR, { recursive: true });

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const [slug, { word, prompt }] of words) {
    const out = join(CARD_DIR, `${slug}.webp`);
    if (existsSync(out) && !force) {
      console.log(`跳过 ${slug}（已存在）`);
      skip++;
      continue;
    }
    const fullPrompt = `a single ${word}, ${STYLE}`;
    try {
      const buf = await PROVIDERS[provider].gen(fullPrompt, key);
      writeFileSync(out, buf);
      console.log(`✓ ${slug}`);
      ok++;
    } catch (e) {
      console.error(`✗ ${slug}: ${e.message}`);
      fail++;
    }
    // 简单限速，避免被服务端拒绝
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`\n完成：成功 ${ok}，跳过 ${skip}，失败 ${fail}`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
