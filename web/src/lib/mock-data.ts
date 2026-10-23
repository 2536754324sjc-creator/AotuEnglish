import type { Course, ReportRow, TodayProgress, Unit, WeeklyReport } from './types';
import { toUnits } from './dify-adapter';
import type { DifyCourse } from './dify-adapter';
import sampleOuCourse from './sample-ou-course.json';
import sampleOuTeen from './sample-ou-teen.json';

/**
 * Mock 数据 —— 形状严格按 docs §5.1 的接口契约。
 * 接后端时只替换本文件，页面与组件一行不改。
 */

const unitMeta = [
  { topic: 'Greetings', titleZh: '问候', icon: 'chat' },
  { topic: 'Colors', titleZh: '颜色', icon: 'drop' },
  { topic: 'Animals', titleZh: '动物', icon: 'paw' },
  { topic: 'Numbers', titleZh: '数字', icon: 'dice' },
  { topic: 'My Family', titleZh: '我的家', icon: 'house' },
];

/** 每个单元自己的词表 —— 题目只从本单元的词里出，不跨单元串题 */
const wordBank: Record<string, string[]> = {
  Greetings: ['hello', 'hi', 'bye', 'thanks', 'please', 'sorry'],
  Colors: ['red', 'blue', 'green', 'yellow', 'pink', 'orange'],
  Animals: ['cat', 'dog', 'bird', 'fish', 'rabbit', 'panda'],
  Numbers: ['one', 'two', 'three', 'four', 'five', 'six'],
  'My Family': ['mom', 'dad', 'sister', 'brother', 'baby', 'grandma'],
};

function buildQuestions(unitIndex: number): Unit['questions'] {
  const current = unitMeta[unitIndex] ?? unitMeta[0];
  const bank = wordBank[current.topic] ?? ['hello', 'thank you'];
  const [w1, w2, w3, w4, w5, w6] = bank;
  const capitalize = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
  const base = [
    {
      id: `u${unitIndex}-q1`,
      type: 'listen_choose_image' as const,
      promptZh: '听一听，选出正确的图',
      audioText: w1,
      options: [
        { id: 'a', imagePrompt: `${w1} flat illustration`, correct: true },
        { id: 'b', imagePrompt: `${w2} flat illustration`, correct: false },
        { id: 'c', imagePrompt: `${w3} flat illustration`, correct: false },
      ],
    },
    {
      id: `u${unitIndex}-q2`,
      type: 'tap_to_read' as const,
      promptZh: '点一下听发音',
      audioText: w2,
      options: [{ id: 'a', text: capitalize(w2), correct: true }],
    },
    {
      id: `u${unitIndex}-q3`,
      type: 'listen_choose_image' as const,
      promptZh: '听一听，选出正确的图',
      audioText: w3,
      options: [
        { id: 'a', imagePrompt: `${w2} flat illustration`, correct: false },
        { id: 'b', imagePrompt: `${w3} flat illustration`, correct: true },
      ],
    },
    {
      id: `u${unitIndex}-q4`,
      type: 'tap_to_read' as const,
      promptZh: '点一下听发音',
      audioText: w4,
      options: [{ id: 'a', text: capitalize(w4), correct: true }],
    },
    {
      id: `u${unitIndex}-q5`,
      type: 'listen_choose_image' as const,
      promptZh: '再听一次，选出正确的图',
      audioText: w5,
      options: [
        { id: 'a', imagePrompt: `${w4} flat illustration`, correct: false },
        { id: 'b', imagePrompt: `${w5} flat illustration`, correct: true },
        { id: 'c', imagePrompt: `${w6} flat illustration`, correct: false },
      ],
    },
    {
      id: `u${unitIndex}-q6`,
      type: 'tap_to_read' as const,
      promptZh: '最后再听一遍',
      audioText: w6,
      options: [{ id: 'a', text: capitalize(w6), correct: true }],
    },
  ];
  return base;
}

const units: Unit[] = unitMeta.map((meta, i) => ({
  unitId: `kids-a-${meta.topic.toLowerCase().replace(/\s/g, '-')}`,
  index: i + 1,
  level: 'kids-a',
  topic: meta.topic,
  titleZh: meta.titleZh,
  wordCount: 6 + i,
  estMinutes: 5 + (i % 3),
  status: i < 3 ? 'done' : i === 3 ? 'current' : 'locked',
  questions: buildQuestions(i),
}));

/**
 * OU 工作流产出的真实样例。
 * kids-a-farm 覆盖「数字」这一关（题目换成农场主题），teen-sample 是青少年档样例。
 *
 * 注意：unitId 保留原来的 kids-a-numbers，否则路由 /learn/unit/kids-a-numbers 会失效。
 * 真实接入时 unitId 由后端统一分配，不会出现这个问题。
 */
const ouUnits = toUnits(sampleOuCourse as DifyCourse);
const ouSample = ouUnits[0];
if (ouSample) {
  const target = units.findIndex((u) => u.unitId === 'kids-a-numbers');
  if (target >= 0) {
    units[target] = {
      ...units[target],
      wordCount: ouSample.wordCount,
      estMinutes: ouSample.estMinutes,
      questions: ouSample.questions,
    };
  }
}

/**
 * OU 产出的其它内容档样例：直接作为一个可访问单元，用于验证 teen / adult 档。
 *
 * 注意：全部为 locked。之前这里把额外单元都设成 'current'，
 * 导致地图上同时出现两个「当前关」（契约 §7 要求最多一个）。
 * 「当前关」只能由 learner 的真实进度决定，样例内容不该抢这个状态。
 */
const extraUnits: Unit[] = toUnits(sampleOuTeen as DifyCourse).map((u, i) => ({
  ...u,
  index: units.length + i + 1,
  status: 'locked' as const,
}));

units.push(...extraUnits);

export const mockTodayProgress: TodayProgress = {
  learnerName: 'Mia',
  level: 'kids-a',
  starsToday: 3,
  starsGoal: 5,
  starTotal: 128,
  currentUnitIndex: 4,
  chestRemaining: 2,
  units,
};

export const mockCourses: Course[] = [
  {
    slug: 'phonics-starter',
    titleZh: '自然拼读入门',
    titleEn: 'Phonics Starter',
    level: 'kids-a',
    domain: 'phonics',
    unitCount: 24,
  },
  {
    slug: 'first-words',
    titleZh: '高频词 200',
    titleEn: 'First 200 Words',
    level: 'kids-a',
    domain: 'words',
    unitCount: 32,
  },
  {
    slug: 'farm-animals',
    titleZh: '农场动物',
    titleEn: 'Farm Animals',
    level: 'kids-a',
    domain: 'words',
    unitCount: 8,
  },
  {
    slug: 'daily-talk',
    titleZh: '日常口语对话',
    titleEn: 'Daily Talk',
    level: 'kids-b',
    domain: 'speaking',
    unitCount: 20,
  },
  {
    slug: 'picture-books',
    titleZh: '分级绘本与儿歌',
    titleEn: 'Picture Books',
    level: 'kids-b',
    domain: 'reading',
    unitCount: 18,
  },
  {
    slug: 'school-life',
    titleZh: '校园生活英语',
    titleEn: 'School Life',
    level: 'teen',
    domain: 'reading',
    unitCount: 16,
  },
  {
    slug: 'exam-grammar',
    titleZh: '中考语法精讲',
    titleEn: 'Exam Grammar',
    level: 'teen',
    domain: 'reading',
    unitCount: 24,
  },
  {
    slug: 'business-english',
    titleZh: '商务英语场景',
    titleEn: 'Business English',
    level: 'adult',
    domain: 'business',
    unitCount: 40,
  },
  {
    slug: 'workplace-writing',
    titleZh: '职场邮件写作',
    titleEn: 'Workplace Writing',
    level: 'adult',
    domain: 'business',
    unitCount: 16,
  },
];

export const mockWeeklyReport: WeeklyReport = {
  weekLabel: '11/03–11/09',
  minutes: 68,
  unitsDone: 21,
  unitsTotal: 25,
  streakDays: 5,
  dailyMinutes: [
    { day: '一', minutes: 12 },
    { day: '二', minutes: 16 },
    { day: '三', minutes: 9 },
    { day: '四', minutes: 4 },
    { day: '五', minutes: 18 },
    { day: '六', minutes: 14 },
    { day: '日', minutes: 5 },
  ],
  weakSounds: [
    { sound: '/θ/', noteZh: 'think、three 的 th 发不准' },
    { sound: '/ð/', noteZh: 'this、that 的 th 发成 d' },
  ],
  unitMastery: [
    { unit: '动物', percent: 92 },
    { unit: '数字', percent: 78 },
    { unit: '我的家', percent: 41 },
  ],
};

export const mockReportRows: ReportRow[] = [
  { day: '11/03', unit: '问候', questions: 12, accuracy: 92, minutes: 12 },
  { day: '11/04', unit: '颜色', questions: 14, accuracy: 86, minutes: 16 },
  { day: '11/05', unit: '动物', questions: 10, accuracy: 90, minutes: 9 },
  { day: '11/06', unit: '复习', questions: 6, accuracy: 100, minutes: 4 },
  { day: '11/07', unit: '数字', questions: 18, accuracy: 78, minutes: 18 },
  { day: '11/08', unit: '数字', questions: 16, accuracy: 81, minutes: 14 },
  { day: '11/09', unit: '我的家', questions: 8, accuracy: 63, minutes: 5 },
];

/** 0 数据的周报页面，用来验证空态（不渲染空坐标轴） */
export const mockEmptyReport: WeeklyReport = {
  weekLabel: '11/10–11/16',
  minutes: 0,
  unitsDone: 0,
  unitsTotal: 25,
  streakDays: 0,
  dailyMinutes: [],
  weakSounds: [],
  unitMastery: [],
};

export function getUnit(unitId: string): Unit | undefined {
  return units.find((u) => u.unitId === unitId);
}
