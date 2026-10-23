#!/usr/bin/env node
/**
 * 从词库 + 图卡 + 音频自动生成 src/lib/mock-words.ts 的完整词表。
 *
 * 为什么要有这个脚本：
 * - 101 个词条手写音标/中文极易出错，且容易和词库脱节
 * - 每补一批图卡，重跑一次就能让页面同步，不用手工维护三份数据
 *
 * 数据事实来源（按优先级）：
 * - 音标 / 中文 / 分组：本脚本内置的 DICT（人工校对过）
 * - 有哪些图卡：public/cards/*.jpg
 * - 有哪些音频：public/audio/*.mp3
 *
 * 用法：
 *   node scripts/gen-mock-words.mjs            # 生成并写入
 *   node scripts/gen-mock-words.mjs --dry-run  # 只报告缺失与统计
 */

import { writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CARD_DIR = join(ROOT, 'public', 'cards');
const AUDIO_DIR = join(ROOT, 'public', 'audio');
const OUT = join(ROOT, 'src', 'lib', 'mock-words.ts');

/**
 * 词条定义：[显示词, 音标, 中文, 所属单元, 默认是否已收集]
 * 分组与 mock-data.ts 的五个单元一一对应，方便后续接后端时按单元发词。
 */
const GROUPS = [
  {
    unit: '问候',
    words: [
      ['hello', '/həˈloʊ/', '你好'],
      ['bye', '/baɪ/', '再见'],
      ['thanks', '/θæŋks/', '谢谢'],
      ['please', '/pliːz/', '请'],
    ],
  },
  {
    unit: '颜色',
    words: [
      ['red', '/red/', '红色'],
      ['blue', '/bluː/', '蓝色'],
      ['green', '/ɡriːn/', '绿色'],
      ['yellow', '/ˈjeloʊ/', '黄色'],
      ['black', '/blæk/', '黑色'],
      ['white', '/waɪt/', '白色'],
      ['pink', '/pɪŋk/', '粉色'],
      ['orange', '/ˈɔːrɪndʒ/', '橙色'],
      ['purple', '/ˈpɜːrpəl/', '紫色'],
      ['brown', '/braʊn/', '棕色'],
    ],
  },
  {
    unit: '动物',
    words: [
      ['cat', '/kæt/', '猫'],
      ['dog', '/dɔːɡ/', '狗'],
      ['bird', '/bɜːrd/', '鸟'],
      ['fish', '/fɪʃ/', '鱼'],
      ['duck', '/dʌk/', '鸭子'],
      ['horse', '/hɔːrs/', '马'],
      ['rabbit', '/ˈræbɪt/', '兔子'],
      ['panda', '/ˈpændə/', '熊猫'],
      ['lion', '/ˈlaɪən/', '狮子'],
      ['tiger', '/ˈtaɪɡər/', '老虎'],
      ['monkey', '/ˈmʌŋki/', '猴子'],
      ['elephant', '/ˈelɪfənt/', '大象'],
      ['bear', '/ber/', '熊'],
      ['frog', '/frɔːɡ/', '青蛙'],
      ['bee', '/biː/', '蜜蜂'],
      ['ant', '/ænt/', '蚂蚁'],
      ['hen', '/hen/', '母鸡'],
      ['goat', '/ɡoʊt/', '山羊'],
      ['mouse', '/maʊs/', '老鼠'],
      ['snake', '/sneɪk/', '蛇'],
      ['cow', '/kaʊ/', '奶牛'],
      ['pig', '/pɪɡ/', '猪'],
      ['sheep', '/ʃiːp/', '绵羊'],
    ],
  },
  {
    unit: '数字',
    words: [
      ['one', '/wʌn/', '一'],
      ['two', '/tuː/', '二'],
      ['three', '/θriː/', '三'],
      ['four', '/fɔːr/', '四'],
      ['five', '/faɪv/', '五'],
      ['six', '/sɪks/', '六'],
      ['seven', '/ˈsevən/', '七'],
      ['eight', '/eɪt/', '八'],
      ['nine', '/naɪn/', '九'],
      ['ten', '/ten/', '十'],
    ],
  },
  {
    unit: '我的家',
    words: [
      ['mom', '/mɑːm/', '妈妈'],
      ['dad', '/dæd/', '爸爸'],
      ['baby', '/ˈbeɪbi/', '宝宝'],
      ['sister', '/ˈsɪstər/', '姐姐／妹妹'],
      ['brother', '/ˈbrʌðər/', '哥哥／弟弟'],
      ['grandma', '/ˈɡrænmɑː/', '奶奶／外婆'],
      ['grandpa', '/ˈɡrænpɑː/', '爷爷／外公'],
      ['family', '/ˈfæməli/', '家人'],
      ['table', '/ˈteɪbəl/', '桌子'],
      ['chair', '/tʃer/', '椅子'],
      ['door', '/dɔːr/', '门'],
      ['window', '/ˈwɪndoʊ/', '窗户'],
      ['bed', '/bed/', '床'],
      ['clock', '/klɑːk/', '钟表'],
      ['key', '/kiː/', '钥匙'],
    ],
  },
  {
    unit: '食物',
    words: [
      ['apple', '/ˈæpəl/', '苹果'],
      ['banana', '/bəˈnænə/', '香蕉'],
      ['orange-fruit', '/ˈɔːrɪndʒ/', '橙子'],
      ['bread', '/bred/', '面包'],
      ['milk', '/mɪlk/', '牛奶'],
      ['egg', '/eɡ/', '鸡蛋'],
      ['rice', '/raɪs/', '米饭'],
      ['cake', '/keɪk/', '蛋糕'],
      ['water', '/ˈwɔːtər/', '水'],
      ['juice', '/dʒuːs/', '果汁'],
      ['noodles', '/ˈnuːdəlz/', '面条'],
    ],
  },
  {
    unit: '身体',
    words: [
      ['hand', '/hænd/', '手'],
      ['foot', '/fʊt/', '脚'],
      ['eye', '/aɪ/', '眼睛'],
      ['ear', '/ɪr/', '耳朵'],
      ['nose', '/noʊz/', '鼻子'],
      ['mouth', '/maʊθ/', '嘴巴'],
      ['head', '/hed/', '头'],
      ['hair', '/her/', '头发'],
    ],
  },
  {
    unit: '日常用品',
    words: [
      ['book', '/bʊk/', '书'],
      ['bag', '/bæɡ/', '书包'],
      ['cup', '/kʌp/', '杯子'],
      ['spoon', '/spuːn/', '勺子'],
      ['ball', '/bɔːl/', '球'],
      ['pencil', '/ˈpensəl/', '铅笔'],
      ['car', '/kɑːr/', '小汽车'],
    ],
  },
  {
    unit: '交通工具',
    words: [
      ['bus', '/bʌs/', '公交车'],
      ['bike', '/baɪk/', '自行车'],
      ['train', '/treɪn/', '火车'],
      ['plane', '/pleɪn/', '飞机'],
      ['boat', '/boʊt/', '船'],
      ['truck', '/trʌk/', '卡车'],
    ],
  },
  {
    unit: '天气与自然',
    words: [
      ['sun', '/sʌn/', '太阳'],
      ['moon', '/muːn/', '月亮'],
      ['star', '/stɑːr/', '星星'],
      ['rain', '/reɪn/', '雨'],
      ['snow', '/snoʊ/', '雪'],
      ['cloud', '/klaʊd/', '云'],
      ['tree', '/triː/', '树'],
      ['flower', '/ˈflaʊər/', '花'],
      ['grass', '/ɡræs/', '草'],
      ['wind', '/wɪnd/', '风'],
    ],
  },
  {
    unit: '动作',
    words: [
      ['run', '/rʌn/', '跑'],
      ['jump', '/dʒʌmp/', '跳'],
      ['sit', '/sɪt/', '坐'],
      ['eat', '/iːt/', '吃'],
      ['drink', '/drɪŋk/', '喝'],
      ['sleep', '/sliːp/', '睡觉'],
      ['walk', '/wɔːk/', '走'],
      ['read', '/riːd/', '阅读'],
      ['write', '/raɪt/', '写'],
      ['sing', '/sɪŋ/', '唱歌'],
    ],
  },
];

/**
 * 已收集（已通关）的词：对应 mock-data.ts 里 status === 'done' 的单元。
 * 目前只有问候 + 颜色 + 前两个数字是「已通关」状态，其余显示为待解锁，
 * 这样词卡页的「已收集 / 未收集」筛选才有真实对比。
 */
const COLLECTED = new Set(['hello', 'bye', 'thanks', 'please', 'red', 'blue', 'green', 'yellow', 'one', 'two']);

function readSlugs(dir, ext) {
  if (!existsSync(dir)) return new Set();
  return new Set(
    readdirSync(dir)
      .filter((f) => f.endsWith(ext) && !f.startsWith('_'))
      .map((f) => f.replace(new RegExp(`${ext.replace('.', '\\.')}$`), '')),
  );
}

function main() {
  const dry = process.argv.slice(2).includes('--dry-run');
  const cards = readSlugs(CARD_DIR, '.jpg');
  const audio = readSlugs(AUDIO_DIR, '.mp3');

  const rows = [];
  const noCard = [];
  const noAudio = [];

  for (const g of GROUPS) {
    rows.push(`\n  // ${g.unit}`);
    for (const [word, phonetic, meaningZh] of g.words) {
      if (!cards.has(word)) noCard.push(word);
      if (!audio.has(word)) noAudio.push(word);
      const collected = COLLECTED.has(word);
      rows.push(
        `  { word: '${word}', phonetic: '${phonetic}', meaningZh: '${meaningZh}', ` +
          `unitZh: '${g.unit}', collected: ${collected}, level: 'kids-a' },`,
      );
    }
  }

  const total = GROUPS.reduce((n, g) => n + g.words.length, 0);

  console.log(`词条 ${total} 个，分 ${GROUPS.length} 组`);
  console.log(`缺图卡：${noCard.length ? noCard.join(', ') : '无'}`);
  console.log(`缺音频：${noAudio.length ? noAudio.join(', ') : '无'}`);

  if (dry) return;

  const header = `import type { Level } from '@/design/tokens';

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

/**
 * 词卡数据：来自词库（gen-wordbank.mjs 的 WORD_BANK）。
 *
 * 本文件由 scripts/gen-mock-words.mjs 生成，不要手改：
 * 补完图卡后重跑 \`node scripts/gen-mock-words.mjs\` 即可同步。
 */
export const mockWords: WordCard[] = [${rows.join('\n')}
];

/** 空词包状态：全新学习者还没通关任何单元 */
export const emptyWords: WordCard[] = [];
`;

  writeFileSync(OUT, header);
  console.log(`已写入 ${OUT}`);
}

main();
