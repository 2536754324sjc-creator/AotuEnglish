import type { TodayProgress, Unit } from './types';

/**
 * 学习进度的本地持久化（mock 模式专用）。
 *
 * 为什么需要它：HANDOFF §三 第 2、8、9 项 —— 做题结果、词卡「已收集」、读物进度
 * 原本全是写死的静态值，答完一关刷新就回到原样。这里把「哪些单元已完成」
 * 落进 localStorage，让地图、词卡、读物都从同一份事实推导。
 *
 * 接后端后本模块整体废弃：这些状态改由 `GET /users/me/progress` 返回。
 */

const DONE_KEY = 'aotu.doneUnits';
const READING_KEY = 'aotu.readingProgress';

function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* 隐私模式写不进去：本次会话内仍按内存值返回 */
  }
}

/* ---------------- 已完成单元 ---------------- */

export function getDoneUnits(): string[] {
  const raw = safeGet(DONE_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function markUnitDone(unitId: string): string[] {
  const next = Array.from(new Set([...getDoneUnits(), unitId]));
  safeSet(DONE_KEY, JSON.stringify(next));
  return next;
}

/* ---------------- 读物进度 ---------------- */

/** readingId -> 已读页数 */
export type ReadingProgress = Record<string, number>;

export function getReadingProgress(): ReadingProgress {
  const raw = safeGet(READING_KEY);
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? (obj as ReadingProgress) : {};
  } catch {
    return {};
  }
}

/** 记录读物读到第几页；只前进不后退 */
export function saveReadingPage(readingId: string, page: number): ReadingProgress {
  const cur = getReadingProgress();
  const prev = cur[readingId] ?? 0;
  const next = { ...cur, [readingId]: Math.max(prev, page) };
  safeSet(READING_KEY, JSON.stringify(next));
  return next;
}

/* ---------------- 地图进度 ---------------- */

/**
 * 把「已完成单元」叠加到地图进度上。
 *
 * 规则与答题机一致：**完成过的单元保持 done，不因为重玩而退回**；
 * 「当前关」推进到第一个未完成的单元（按单元顺序）。
 *
 * 注意：不修改传入对象（mockTodayProgress 是模块级常量，直接改会污染整个进程的生命周期）。
 */
export function applyDoneUnits(progress: TodayProgress, doneIds: string[]): TodayProgress {
  if (!doneIds.length) return progress;
  const done = new Set(doneIds);

  // 先叠完成态
  const units: Unit[] = progress.units.map((u) =>
    done.has(u.unitId) ? { ...u, status: 'done' as const } : { ...u },
  );

  // 当前关 = 第一个未完成的单元；全部完成则没有当前关
  const firstOpen = units.findIndex((u) => u.status !== 'done');
  if (firstOpen < 0) {
    return { ...progress, units, currentUnitIndex: progress.currentUnitIndex };
  }

  // 只有第一个未完成的是 current，其后未完成的保持/降为 locked
  const withCurrent = units.map((u, i) => {
    if (u.status === 'done') return u;
    return i === firstOpen ? { ...u, status: 'current' as const } : { ...u, status: 'locked' as const };
  });

  return {
    ...progress,
    units: withCurrent,
    currentUnitIndex: firstOpen,
  };
}
