import type { Level } from '@/design/tokens';
import { levels } from '@/design/tokens';

/**
 * 家长端设置类数据（计划 / 学习者 / 偏好 / 账号）。
 *
 * 这些接口在 `docs/api-contract.md` 里还没有正式条目 —— 契约只覆盖了
 * 学习主链路（课程、单元、进度、作答、周报）。这里先把形状定下来，
 * 并沿用契约的命名习惯，等后端补齐时按本文档实现即可。
 *
 * 写入策略：目前只有本地 mock（localStorage），
 * `api.ts` 里 `NEXT_PUBLIC_API_MODE=live` 时走对应的 REST 路径。
 */

/** 学习计划：一个学习者当前的节奏设置 */
export type StudyPlan = {
  level: Level;
  /** 每日目标分钟数 */
  dailyMinutes: number;
  /** 每日目标星数 */
  dailyStars: number;
  /** 每周学习天数（1-7） */
  daysPerWeek: number;
  /** 提醒时间（HH:mm），空字符串表示不提醒 */
  remindAt: string;
  /** 每周固定休息日（0=周日 … 6=周六） */
  restDays: number[];
};

/** 学习者档案 */
export type Learner = {
  id: string;
  name: string;
  level: Level;
  /** 头像用的首字或 emoji */
  avatar: string;
  /** 出生年份，用来推算年龄档建议；null 表示未填 */
  birthYear: number | null;
  createdAt: string;
  /** 是否为当前正在学习的那一个 */
  active: boolean;
};

/** 通知与体验偏好 */
export type StudyPreferences = {
  /** 每周周报邮件 */
  weeklyReportEmail: boolean;
  /** 每天学习提醒 */
  dailyReminder: boolean;
  /** 免打扰时段开始（HH:mm） */
  quietStart: string;
  /** 免打扰时段结束（HH:mm） */
  quietEnd: string;
  /** 答题音效 */
  soundEffects: boolean;
  /** 界面语言 */
  locale: 'zh' | 'en';
};

/** 账号与订阅概况 */
export type AccountOverview = {
  email: string;
  /** 显示名 */
  name: string;
  /** 当前方案 id，对应 /pricing 的 plans[].id */
  planId: 'free' | 'family' | 'family-plus';
  planName: string;
  /** 计费周期 */
  cycle: 'monthly' | 'yearly' | null;
  /** 当前周期结束时间；免费版为 null */
  renewsAt: string | null;
  /** 订单记录（倒序） */
  invoices: Invoice[];
};

export type Invoice = {
  id: string;
  /** ISO 日期 */
  date: string;
  amount: number;
  status: 'paid' | 'refunded' | 'pending';
  planName: string;
};

/** 内容档的中文名与年龄区间，四处页面共用，避免各写一份 */
export const LEVEL_META: Record<Level, { label: string; ages: string; blurb: string }> = {
  'kids-a': { label: '启蒙档', ages: levels['kids-a'].label, blurb: '大图少字，触摸目标大' },
  'kids-b': { label: '进阶档', ages: levels['kids-b'].label, blurb: '中图加短句' },
  teen: { label: '青少年档', ages: levels.teen.label, blurb: '以文字为主' },
  adult: { label: '成人档', ages: levels.adult.label, blurb: '信息密集，含商务场景' },
};

export const ALL_LEVELS: Level[] = ['kids-a', 'kids-b', 'teen', 'adult'];
