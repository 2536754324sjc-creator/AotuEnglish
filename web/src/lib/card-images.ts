/**
 * 图卡图片的解析规则。
 *
 * 命名与目录约定：
 *   web/public/cards/{word}.jpg
 *
 * 为什么用「词」作为文件名而不是选项 id：
 * 同一个词（如 cow）会出现在多道题的多个选项里，按词存一份即可复用，
 * 也方便人工替换单张图。不同题里同词的图必须一致，按 id 存会重复且易不一致。
 *
 * 为什么是 .jpg：智谱 CogView 返回的是 JPEG，脚本统一转成 .jpg 存盘。
 */

export const CARD_DIR = '/cards';

/** 卡片图片扩展名，与 scripts/gen-card-images.mjs 保持一致 */
export const CARD_EXT = '.jpg';

/** 把英文词规整成文件名：小写、空格转连字符、去掉标点 */
export function wordToSlug(word: string): string {
  return word
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

/**
 * 从 imagePrompt 推出文件名。
 * imagePrompt 形如 "a cartoon cow, flat vector illustration..."，
 * 取第一个逗号前的部分，剥掉冠词与画风修饰词。
 *
 * 注意：像 "greeting hello" / "color red" 这种「主题词 + 主角词」的写法，
 * 主角词在后面，要取最后一个有意义的词，否则会得到 greeting-hello 这种错名。
 */
export function promptToSlug(source: string): string {
  const head = source.split(',')[0] ?? '';
  const words = head
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !['a', 'an', 'the', 'cartoon', 'illustration', 'flat', 'vector', 'simple'].includes(w));

  if (words.length === 0) return '';
  // 取最后一个词作为主角词
  return wordToSlug(words[words.length - 1]);
}

/**
 * 决定某张卡该用哪个图片地址。
 * 优先级：显式 imageUrl > 由 audioText 推出的约定路径 > 由 imagePrompt 推出的路径。
 * 注意：这里只生成「候选地址」，文件是否存在由浏览器加载结果决定，
 * 不存在时会自动回落到占位图，不需要在这里做文件系统检查。
 */
export function resolveCardImage(option: {
  imageUrl?: string;
  imagePrompt?: string;
  text?: string;
}): string | null {
  if (option.imageUrl) return option.imageUrl;

  const fromText = option.text ? wordToSlug(option.text) : '';
  if (fromText) return `${CARD_DIR}/${fromText}${CARD_EXT}`;

  const fromPrompt = option.imagePrompt ? promptToSlug(option.imagePrompt) : '';
  if (fromPrompt) return `${CARD_DIR}/${fromPrompt}${CARD_EXT}`;

  return null;
}
