import type { Level } from '@/design/tokens';

/** 题型枚举 —— 与前端组件一一对应，新增题型只加枚举值 */
export type QuestionType =
  | 'listen_choose_image'
  | 'repeat_word'
  | 'blend_sounds'
  | 'tap_to_read'
  | 'read_choose'
  | 'cloze'
  | 'business_scenario';

export type Option = {
  id: string;
  imagePrompt?: string;
  imageUrl?: string;
  text?: string;
  correct: boolean;
};

export type Question = {
  id: string;
  type: QuestionType;
  promptZh: string;
  audioText: string;
  options: Option[];
};

/* ---------------- 作答上报（契约 §4.6） ---------------- */

/** 上报前收集的答案；elapsedMs 为 -1 表示该题耗时未知（不参与统计） */
export type CollectedAnswer = {
  questionId: string;
  correct: boolean;
  /** 试了几次才答对 —— 周报「薄弱项」靠它算 */
  attempts: number;
  elapsedMs: number;
};

/** 答题机在整关结束时给出的提交载荷（时间由答题机自己记） */
export type AnswerReport = {
  startedAt: string;
  finishedAt: string;
  answers: CollectedAnswer[];
};

/**
 * 结算页通过 history.state 收到的接力数据。
 *
 * 为什么不复用 `?stars=`：星星必须来自服务端（契约 §4.6），
 * 而 URL 参数是客户端可改的；服务端结果放这里，刷新后自然失效，
 * 刷新过的结算页会回落到「只读视图」而不是显示一个编出来的分数。
 */
export type DoneHandoff = {
  stars: number;
  starTotal?: number;
  nextUnitId?: string | null;
  /** 上报失败时的原因，用来决定是否显示「这次没存上」 */
  submitError?: boolean;
  /** 体验课等不落库的场景 */
  trial?: boolean;
};

export type UnitStatus = 'done' | 'current' | 'locked';

export type Unit = {
  unitId: string;
  index: number;
  level: Level;
  topic: string;
  titleZh: string;
  wordCount: number;
  estMinutes: number;
  status: UnitStatus;
  questions: Question[];
};

export type Course = {
  slug: string;
  titleZh: string;
  titleEn: string;
  level: Level;
  domain: 'phonics' | 'words' | 'reading' | 'speaking' | 'business';
  unitCount: number;
};

export type TodayProgress = {
  learnerName: string;
  level: Level;
  starsToday: number;
  starsGoal: number;
  starTotal: number;
  currentUnitIndex: number;
  chestRemaining: number;
  units: Unit[];
};

export type WeeklyReport = {
  weekLabel: string;
  minutes: number;
  unitsDone: number;
  unitsTotal: number;
  streakDays: number;
  dailyMinutes: { day: string; minutes: number }[];
  weakSounds: { sound: string; noteZh: string }[];
  unitMastery: { unit: string; percent: number }[];
};

/** 周报明细表的一行 */
export type ReportRow = {
  day: string;
  unit: string;
  questions: number;
  accuracy: number;
  minutes: number;
};
