#!/usr/bin/env node
/**
 * 生成站点分享图（og.png, 1200×630）与 Apple 图标（apple-icon.png, 180×180）。
 *
 * 为什么用代码画而不是设计稿导出：
 * - 图里只有品牌名、标语和几个色块，代码画完全够用，还能随时改文案
 * - 不依赖外部设计工具，换人接手也能改
 * - 保证 OG 图与站点主色一致（颜色取自 design/tokens 的同一组值）
 *
 * 用法：node scripts/gen-og.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');

/** 与 src/styles/global.css 的主色保持一致 */
const C = {
  sky1: '#f2f9ff',
  sky2: '#dceeff',
  ink: '#12233f',
  ink2: '#40567a',
  blue: '#2f7cf6',
  blueDeep: '#15479e',
  sun: '#ffc53d',
  green: '#39b96b',
  white: '#ffffff',
};

/** 1200×630 分享图 */
function ogSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C.sky1}"/>
      <stop offset="100%" stop-color="${C.sky2}"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- 丘陵：呼应首页地图。压在最底层，不遮挡文字与标签 -->
  <path d="M0 470 C200 410 360 500 560 460 S920 380 1120 440 s120 60 200 20 v170 H0 z" fill="#d8efd3" opacity="0.75"/>
  <path d="M0 530 c220 -50 400 30 620 -10 s360 -60 580 0 200 40 240 -10 v120 H0 z" fill="#c4e7c2" opacity="0.75"/>

  <!-- 品牌标记 -->
  <rect x="80" y="86" width="76" height="76" rx="20" fill="${C.blue}"/>
  <text x="118" y="142" font-family="Arial, Helvetica, sans-serif" font-size="46"
        font-weight="bold" fill="${C.white}" text-anchor="middle">A</text>
  <text x="176" y="140" font-family="Arial, Helvetica, sans-serif" font-size="40"
        font-weight="bold" fill="${C.ink}">AotuEnglish</text>

  <!-- 主标题 -->
  <text x="80" y="268" font-family="Arial, Helvetica, sans-serif" font-size="72"
        font-weight="bold" fill="${C.ink}">每天 15 分钟，</text>
  <text x="80" y="358" font-family="Arial, Helvetica, sans-serif" font-size="72"
        font-weight="bold" fill="${C.ink}">真的开口</text>

  <!-- 副标题 -->
  <text x="80" y="424" font-family="Arial, Helvetica, sans-serif" font-size="28"
        fill="${C.ink2}">一张看得见进度的英语学习地图 · 4 岁到成人</text>

  <!-- 三个标签 -->
  <g font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold">
    <rect x="80" y="462" width="188" height="56" rx="28" fill="${C.white}"/>
    <rect x="80" y="462" width="188" height="56" rx="28" fill="none" stroke="#dbe9f8" stroke-width="2"/>
    <text x="174" y="498" fill="${C.blueDeep}" text-anchor="middle">分层闯关</text>

    <rect x="286" y="462" width="188" height="56" rx="28" fill="${C.white}"/>
    <rect x="286" y="462" width="188" height="56" rx="28" fill="none" stroke="#dbe9f8" stroke-width="2"/>
    <text x="380" y="498" fill="${C.blueDeep}" text-anchor="middle">即时回响</text>

    <rect x="492" y="462" width="188" height="56" rx="28" fill="${C.white}"/>
    <rect x="492" y="462" width="188" height="56" rx="28" fill="none" stroke="#dbe9f8" stroke-width="2"/>
    <text x="586" y="498" fill="${C.blueDeep}" text-anchor="middle">家长周报</text>
  </g>

  <!-- 右侧地图节点：三态示意 -->
  <g transform="translate(880 300)">
    <circle cx="0" cy="0" r="54" fill="${C.white}" stroke="#cfe4f8" stroke-width="6"/>
    <circle cx="0" cy="0" r="20" fill="${C.green}"/>
    <path d="M-8 0 l6 7 l12 -14" stroke="${C.white}" stroke-width="5" fill="none"
          stroke-linecap="round" stroke-linejoin="round"/>

    <circle cx="118" cy="-62" r="62" fill="${C.white}" stroke="${C.sun}" stroke-width="8"/>
    <circle cx="118" cy="-62" r="34" fill="${C.blue}"/>

    <circle cx="214" cy="14" r="46" fill="${C.white}" stroke="#e6eef8" stroke-width="6"/>
    <circle cx="214" cy="14" r="16" fill="#c9d8ea"/>
  </g>
</svg>`;
}

/** 180×180 Apple 图标：纯色块 + A，避免小尺寸下细节糊掉 */
function appleIconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" rx="40" fill="${C.blue}"/>
  <text x="90" y="128" font-family="Arial, Helvetica, sans-serif" font-size="104"
        font-weight="bold" fill="${C.white}" text-anchor="middle">A</text>
</svg>`;
}

async function main() {
  mkdirSync(PUBLIC, { recursive: true });

  const og = await sharp(Buffer.from(ogSvg())).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(join(PUBLIC, 'og.png'), og);
  console.log(`og.png  1200×630  ${(og.length / 1024).toFixed(1)} KB`);

  const apple = await sharp(Buffer.from(appleIconSvg())).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(join(PUBLIC, 'apple-icon.png'), apple);
  console.log(`apple-icon.png  180×180  ${(apple.length / 1024).toFixed(1)} KB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
