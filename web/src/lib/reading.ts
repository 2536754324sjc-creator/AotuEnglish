import type { ReadingSentence } from './mock-readings';

/**
 * 读本的纯逻辑工具。
 *
 * 为什么单独一个文件：这些函数与 mock 数据无关，
 * 接真实后端后 mock-readings.ts 会删掉，但本文件要保留。
 * 页面只从 api.ts 取数据，取到的句子再交给这里切分。
 */

/** 把一句话按重点词切成可点击的片段 */
export function splitSentence(sentence: ReadingSentence): { text: string; hit: boolean }[] {
  if (!sentence.focus?.length) return [{ text: sentence.en, hit: false }];

  // 用词边界匹配，避免 "cat" 命中 "catapult"；忽略大小写
  const pattern = new RegExp(`\\b(${sentence.focus.map(escapeReg).join('|')})\\b`, 'gi');
  const out: { text: string; hit: boolean }[] = [];
  let last = 0;
  for (const m of sentence.en.matchAll(pattern)) {
    const start = m.index ?? 0;
    if (start > last) out.push({ text: sentence.en.slice(last, start), hit: false });
    out.push({ text: m[0], hit: true });
    last = start + m[0].length;
  }
  if (last < sentence.en.length) out.push({ text: sentence.en.slice(last), hit: false });
  return out;
}

function escapeReg(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
