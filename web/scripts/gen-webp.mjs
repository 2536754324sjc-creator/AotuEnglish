#!/usr/bin/env node
/**
 * 把图卡批量转成 WebP（保留原 JPG 作为回退）。
 *
 * 为什么不直接替换 JPG：
 * - `<picture>` 里 WebP 在前、JPG 在后，老浏览器自动用 JPG，不会白屏
 * - 出问题可以一键回退（删掉 .webp 即可），不需要重新生成图
 *
 * 实测压缩效果（114 张，2026-10-25）：
 *   JPG 原始 5.53 MB → WebP q=78 1.87 MB，省 66%，平均 17 KB/张
 * 画质已用 6 组对比图目视确认（粗描边、平涂色块、细节图均无可见损失）。
 *
 * 用法：
 *   node scripts/gen-webp.mjs            # 只转缺失的
 *   node scripts/gen-webp.mjs --force    # 全部重转
 *   node scripts/gen-webp.mjs --dry-run  # 只报告
 */

import { readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CARD_DIR = join(__dirname, '..', 'public', 'cards');

/** 质量 78：实测在 17KB/张 时画质与 JPG 无可见差异 */
const QUALITY = 78;

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const dry = args.includes('--dry-run');

  const jpgs = readdirSync(CARD_DIR).filter((f) => f.endsWith('.jpg') && !f.startsWith('_'));
  if (jpgs.length === 0) {
    console.log('没有找到 JPG 图卡');
    return;
  }

  let converted = 0;
  let skipped = 0;
  let jpgTotal = 0;
  let webpTotal = 0;

  for (const f of jpgs) {
    const src = join(CARD_DIR, f);
    const out = join(CARD_DIR, basename(f, '.jpg') + '.webp');
    jpgTotal += statSync(src).size;

    if (existsSync(out) && !force) {
      skipped++;
      webpTotal += statSync(out).size;
      continue;
    }

    if (dry) {
      console.log('将转换:', basename(out));
      continue;
    }

    const buf = await sharp(src).webp({ quality: QUALITY, effort: 5 }).toBuffer();
    writeFileSync(out, buf);
    webpTotal += buf.length;
    converted++;
  }

  if (dry) {
    console.log(`\n共 ${jpgs.length} 张待处理（--dry-run 未写入）`);
    return;
  }

  const mb = (n) => (n / 1024 / 1024).toFixed(2);
  console.log(`转换 ${converted} 张，跳过 ${skipped} 张`);
  console.log(`JPG 合计：${mb(jpgTotal)} MB`);
  console.log(`WebP 合计：${mb(webpTotal)} MB`);
  if (jpgTotal > 0) {
    console.log(`体积变化：-${((1 - webpTotal / jpgTotal) * 100).toFixed(1)}%`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
