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
