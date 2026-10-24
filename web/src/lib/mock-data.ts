import type { Course, ReportRow, TodayProgress, Unit, WeeklyReport } from './types';
import { toUnits } from './dify-adapter';
import { demoUnits } from './demo-units';
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
 * OU 产出的其它内容档样例（teen 档），用于验证不同内容档的题目渲染。
 *
 * 关键：**不进 `units`**，也就不会出现在学习地图上。
 *
 * 之前这里 push 进了 units，导致两个问题：
 * 1. 地图只有 5 个节点坐标，第 6 个单元会绕回第 1 个位置，把「问候」整个盖住
 * 2. 路径顺序变成「校园生活 → 颜色 → 动物 → 数字 → 我的家」，
 *    而 4–7 岁应该从「问候」开始，顶栏却还写着「第 4 关」，前后矛盾
 *
 * 现在改为独立导出：地图保持干净的 5 关，样例单元仍可通过
 * `/learn/unit/teen-school-01` 直链访问（真实接入后由后端按档位下发）。
 */
export const sampleUnits: Unit[] = toUnits(sampleOuTeen as DifyCourse).map((u, i) => ({
  ...u,
  index: i + 1,
  status: 'locked' as const,
}));

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

const weeklyDailyMinutes: WeeklyReport['dailyMinutes'] = [
  { day: '一', minutes: 12 },
  { day: '二', minutes: 16 },
  { day: '三', minutes: 9 },
  { day: '四', minutes: 4 },
  { day: '五', minutes: 18 },
  { day: '六', minutes: 14 },
  { day: '日', minutes: 5 },
];

export const mockReportRows: ReportRow[] = [
  { day: '11/03', unit: '问候', questions: 12, accuracy: 92, minutes: 12 },
  { day: '11/04', unit: '颜色', questions: 14, accuracy: 86, minutes: 16 },
  { day: '11/05', unit: '动物', questions: 10, accuracy: 90, minutes: 9 },
  { day: '11/06', unit: '复习', questions: 6, accuracy: 100, minutes: 4 },
  { day: '11/07', unit: '数字', questions: 18, accuracy: 78, minutes: 18 },
  { day: '11/08', unit: '数字', questions: 16, accuracy: 81, minutes: 14 },
  { day: '11/09', unit: '我的家', questions: 8, accuracy: 63, minutes: 5 },
];

/**
 * 本周完成的单元数：从明细表里数「非复习」的单元去重。
 *
 * 为什么算而不是写死：之前写死 21/25，但整个 kids-a 档只有 5 个单元，
 * 家长看到「21/25 完成单元」会觉得课程有 25 关、孩子快学完了，
 * 而实际地图上只有 5 关 —— 数字和页面对不上，比不显示更糟。
 */
const doneUnitsThisWeek = new Set(
  mockReportRows.filter((r) => r.unit !== '复习').map((r) => r.unit),
);

export const mockWeeklyReport: WeeklyReport = {
  weekLabel: '11/03–11/09',
  // 从每日明细汇总，不手写：之前写死 68，而明细合计 78，
  // 家长一眼就能看出「总时长」和「每日分布」对不上。
  minutes: weeklyDailyMinutes.reduce((sum, d) => sum + d.minutes, 0),
  // 本周学过的单元数 / 本档课程总单元数（与学习地图的 5 关一致）
  unitsDone: doneUnitsThisWeek.size,
  unitsTotal: units.length,
  streakDays: 5,
  dailyMinutes: weeklyDailyMinutes,
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

/** 0 数据的周报页面，用来验证空态（不渲染空坐标轴） */
export const mockEmptyReport: WeeklyReport = {
  weekLabel: '11/10–11/16',
  minutes: 0,
  unitsDone: 0,
  unitsTotal: units.length,
  streakDays: 0,
  dailyMinutes: [],
  weakSounds: [],
  unitMastery: [],
};

/**
 * 按 unitId 取单元。
 * 查找顺序：学习者进度 → 内容样例 → 新题型演示单元。
 * 后两者可直链访问，但不会出现在地图上（地图只读 mockTodayProgress.units）。
 *
 * 注意：api.ts 的 mockApi.getUnit 有同样的查找顺序，改这里要同步改那边。
 */
export function getUnit(unitId: string): Unit | undefined {
  return (
    units.find((u) => u.unitId === unitId) ??
    sampleUnits.find((u) => u.unitId === unitId) ??
    demoUnits.find((u) => u.unitId === unitId)
  );
}
