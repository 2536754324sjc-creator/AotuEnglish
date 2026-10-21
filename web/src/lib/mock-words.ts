import type { Level } from '@/design/tokens';

/** 一张词卡 */
export type WordCard = {
  word: string;
  /** 美式音标，简化写法 */
  phonetic: string;
  meaningZh: string;
  /** 所属单元，用于分组 */
  unitZh: string;
  /** 是否已收集；未收集的显示为待解锁 */
  collected: boolean;
  level: Level;
};

/** 词卡数据：来自已通关单元的词 */
export const mockWords: WordCard[] = [
  // 问候
  { word: 'hello', phonetic: '/həˈloʊ/', meaningZh: '你好', unitZh: '问候', collected: true, level: 'kids-a' },
  { word: 'bye', phonetic: '/baɪ/', meaningZh: '再见', unitZh: '问候', collected: true, level: 'kids-a' },
  { word: 'thanks', phonetic: '/θæŋks/', meaningZh: '谢谢', unitZh: '问候', collected: true, level: 'kids-a' },
  { word: 'please', phonetic: '/pliːz/', meaningZh: '请', unitZh: '问候', collected: true, level: 'kids-a' },

  // 颜色
  { word: 'red', phonetic: '/red/', meaningZh: '红色', unitZh: '颜色', collected: true, level: 'kids-a' },
  { word: 'blue', phonetic: '/bluː/', meaningZh: '蓝色', unitZh: '颜色', collected: true, level: 'kids-a' },
  { word: 'green', phonetic: '/ɡriːn/', meaningZh: '绿色', unitZh: '颜色', collected: true, level: 'kids-a' },
  { word: 'yellow', phonetic: '/ˈjeloʊ/', meaningZh: '黄色', unitZh: '颜色', collected: true, level: 'kids-a' },

  // 动物
  { word: 'cat', phonetic: '/kæt/', meaningZh: '猫', unitZh: '动物', collected: true, level: 'kids-a' },
  { word: 'dog', phonetic: '/dɔːɡ/', meaningZh: '狗', unitZh: '动物', collected: true, level: 'kids-a' },
  { word: 'bird', phonetic: '/bɜːrd/', meaningZh: '鸟', unitZh: '动物', collected: true, level: 'kids-a' },
  { word: 'fish', phonetic: '/fɪʃ/', meaningZh: '鱼', unitZh: '动物', collected: true, level: 'kids-a' },

  // 数字：第 4 关词表（来自 OU 工作流样例）
  { word: 'one', phonetic: '/wʌn/', meaningZh: '一', unitZh: '数字', collected: true, level: 'kids-a' },
  { word: 'two', phonetic: '/tuː/', meaningZh: '二', unitZh: '数字', collected: true, level: 'kids-a' },
  { word: 'three', phonetic: '/θriː/', meaningZh: '三', unitZh: '数字', collected: false, level: 'kids-a' },
  { word: 'four', phonetic: '/fɔːr/', meaningZh: '四', unitZh: '数字', collected: false, level: 'kids-a' },

  // 农场：OU 样例里的词，当前关未完成所以未收集
  { word: 'cow', phonetic: '/kaʊ/', meaningZh: '奶牛', unitZh: '我的家', collected: false, level: 'kids-a' },
  { word: 'duck', phonetic: '/dʌk/', meaningZh: '鸭子', unitZh: '我的家', collected: false, level: 'kids-a' },
  { word: 'pig', phonetic: '/pɪɡ/', meaningZh: '猪', unitZh: '我的家', collected: false, level: 'kids-a' },
  { word: 'horse', phonetic: '/hɔːrs/', meaningZh: '马', unitZh: '我的家', collected: false, level: 'kids-a' },
];

/** 空词包状态：全新学习者还没通关任何单元 */
export const emptyWords: WordCard[] = [];
