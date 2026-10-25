import type { TodayProgress, Unit, UnitStatus } from '@/lib/types';

/**
 * 单元内容目录（服务端唯一来源）。
 *
 * 为什么要独立于前端 mock：前端 mock 的单元只存在于浏览器，
 * 服务端判分（见 lib/server/grading.ts）必须知道正确答案，
 * 所以这份目录是后端的权威数据。上线时应由内容管线（Dify）写入数据库，
 * 当前阶段先以静态目录承载，避免再造一套假数据。
 *
 * 与前端保持一致的点：unitId、题目 id、选项 id 必须完全相同，
 * 否则历史作答记录对不上。改动此处需同步检查 web/src/lib/mock-data.ts。
 */

export type ServerOption = { id: string; correct: boolean; text?: string };
export type ServerQuestion = {
  id: string;
  type: string;
  promptZh: string;
  audioText: string;
  options: ServerOption[];
};
export type ServerUnit = {
  unitId: string;
  index: number;
  level: 'kids-a' | 'kids-b' | 'teen' | 'adult';
  topic: string;
  titleZh: string;
  wordCount: number;
  estMinutes: number;
  questions: ServerQuestion[];
};

/**
 * 单元词表 —— 题目只从本单元的词里出，不跨单元串题。
 * 与前端 mock-data.ts 的 wordBank 一致。
 */
const WORD_BANK: Record<string, string[]> = {
  Greetings: ['hello', 'hi', 'bye', 'thanks', 'please', 'sorry'],
  Colors: ['red', 'blue', 'green', 'yellow', 'pink', 'orange'],
  Animals: ['cat', 'dog', 'bird', 'fish', 'rabbit', 'panda'],
  Numbers: ['one', 'two', 'three', 'four', 'five', 'six'],
  'My Family': ['mom', 'dad', 'sister', 'brother', 'baby', 'grandma'],
};

const UNIT_META = [
  { topic: 'Greetings', titleZh: '问候' },
  { topic: 'Colors', titleZh: '颜色' },
  { topic: 'Animals', titleZh: '动物' },
  { topic: 'Numbers', titleZh: '数字' },
  { topic: 'My Family', titleZh: '我的家' },
];

/** 选项 id 约定：题目内用 a/b/c —— 与前端 mock 一致 */
const OPTION_IDS = ['a', 'b', 'c'];

function buildQuestions(unitIndex: number): ServerQuestion[] {
  const meta = UNIT_META[unitIndex] ?? UNIT_META[0];
  const bank = WORD_BANK[meta.topic] ?? ['hello', 'thank you'];
  const [w1, w2, w3, w4, w5, w6] = bank;
  const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

  // 正确答案位置刻意不固定，避免「总选第一个」的猜测策略
  return [
    {
      id: `u${unitIndex}-q1`,
      type: 'listen_choose_image',
      promptZh: '听一听，选出正确的图',
      audioText: w1,
      options: [
        { id: 'a', correct: true },
        { id: 'b', correct: false },
        { id: 'c', correct: false },
      ],
    },
    {
      id: `u${unitIndex}-q2`,
      type: 'tap_to_read',
      promptZh: '点一下听发音',
      audioText: w2,
      options: [{ id: 'a', correct: true, text: cap(w2) }],
    },
    {
      id: `u${unitIndex}-q3`,
      type: 'listen_choose_image',
      promptZh: '听一听，选出正确的图',
      audioText: w3,
      options: [
        { id: 'a', correct: false },
        { id: 'b', correct: true },
      ],
    },
    {
      id: `u${unitIndex}-q4`,
      type: 'tap_to_read',
      promptZh: '点一下听发音',
      audioText: w4,
      options: [{ id: 'a', correct: true, text: cap(w4) }],
    },
    {
      id: `u${unitIndex}-q5`,
      type: 'listen_choose_image',
      promptZh: '再听一次，选出正确的图',
      audioText: w5,
      options: [
        { id: 'a', correct: false },
        { id: 'b', correct: true },
        { id: 'c', correct: false },
      ],
    },
    {
      id: `u${unitIndex}-q6`,
      type: 'tap_to_read',
      promptZh: '最后再听一遍',
      audioText: w6,
      options: [{ id: 'a', correct: true, text: cap(w6) }],
    },
  ];
}

export const SERVER_UNITS: ServerUnit[] = UNIT_META.map((meta, i) => ({
  unitId: `kids-a-${meta.topic.toLowerCase().replace(/\s/g, '-')}`,
  index: i + 1,
  level: 'kids-a' as const,
  topic: meta.topic,
  titleZh: meta.titleZh,
  wordCount: 6 + i,
  estMinutes: 5 + (i % 3),
  questions: buildQuestions(i),
}));

export function findUnit(unitId: string): ServerUnit | undefined {
  return SERVER_UNITS.find((u) => u.unitId === unitId);
}

/** 该单元的所有英文词（用于词卡解锁） */
export function unitWords(unit: ServerUnit): string[] {
  return WORD_BANK[unit.topic] ?? [];
}

/**
 * 对外下发的单元（去掉 correct 字段）。
 *
 * 这是「服务端判分」的一半：客户端只拿选项 id 和展示信息，
 * 拿不到答案。判分见 gradeAnswer()。
 */
export function toClientUnit(unit: ServerUnit, status: UnitStatus): Unit {
  return {
    unitId: unit.unitId,
    index: unit.index,
    level: unit.level,
    topic: unit.topic,
    titleZh: unit.titleZh,
    wordCount: unit.wordCount,
    estMinutes: unit.estMinutes,
    status,
    questions: unit.questions.map((q) => ({
      id: q.id,
      type: q.type as Unit['questions'][number]['type'],
      promptZh: q.promptZh,
      audioText: q.audioText,
      options: q.options.map((o) => ({
        id: o.id,
        text: o.text,
        // 关键：不下发答案
        correct: false,
      })),
    })),
  };
}

/**
 * 词表元数据（音标与中文释义）—— 词卡页展示需要。
 *
 * 为什么放服务端：词卡现在由数据库决定「收没收集」，
 * 释义若还从客户端 mock 来，就会出现「收集状态是新的、释义是旧的」两套数据。
 */
export const WORD_META: Record<string, { phonetic: string; meaningZh: string }> = {
  hello: { phonetic: '/həˈloʊ/', meaningZh: '你好' },
  hi: { phonetic: '/haɪ/', meaningZh: '嗨' },
  bye: { phonetic: '/baɪ/', meaningZh: '再见' },
  thanks: { phonetic: '/θæŋks/', meaningZh: '谢谢' },
  please: { phonetic: '/pliːz/', meaningZh: '请' },
  sorry: { phonetic: '/ˈsɔːri/', meaningZh: '对不起' },
  red: { phonetic: '/red/', meaningZh: '红色' },
  blue: { phonetic: '/bluː/', meaningZh: '蓝色' },
  green: { phonetic: '/ɡriːn/', meaningZh: '绿色' },
  yellow: { phonetic: '/ˈjeloʊ/', meaningZh: '黄色' },
  pink: { phonetic: '/pɪŋk/', meaningZh: '粉色' },
  orange: { phonetic: '/ˈɔːrɪndʒ/', meaningZh: '橙色' },
  cat: { phonetic: '/kæt/', meaningZh: '猫' },
  dog: { phonetic: '/dɔːɡ/', meaningZh: '狗' },
  bird: { phonetic: '/bɜːrd/', meaningZh: '鸟' },
  fish: { phonetic: '/fɪʃ/', meaningZh: '鱼' },
  rabbit: { phonetic: '/ˈræbɪt/', meaningZh: '兔子' },
  panda: { phonetic: '/ˈpændə/', meaningZh: '熊猫' },
  one: { phonetic: '/wʌn/', meaningZh: '一' },
  two: { phonetic: '/tuː/', meaningZh: '二' },
  three: { phonetic: '/θriː/', meaningZh: '三' },
  four: { phonetic: '/fɔːr/', meaningZh: '四' },
  five: { phonetic: '/faɪv/', meaningZh: '五' },
  six: { phonetic: '/sɪks/', meaningZh: '六' },
  mom: { phonetic: '/mɑːm/', meaningZh: '妈妈' },
  dad: { phonetic: '/dæd/', meaningZh: '爸爸' },
  sister: { phonetic: '/ˈsɪstər/', meaningZh: '姐妹' },
  brother: { phonetic: '/ˈbrʌðər/', meaningZh: '兄弟' },
  baby: { phonetic: '/ˈbeɪbi/', meaningZh: '宝宝' },
  grandma: { phonetic: '/ˈɡrænmɑː/', meaningZh: '奶奶' },
};

export type { TodayProgress };
