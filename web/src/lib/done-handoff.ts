import type { DoneHandoff } from './types';

/**
 * 结算数据的跨页接力。
 *
 * 单元页答完 → 上报 → 把结果写进 sessionStorage → 跳到结算页读取。
 *
 * 为什么不用 URL 参数或 history.state：
 * - URL 参数（老的 `?stars=3`）用户随手可改，等于把分数交给客户端；
 * - history.state 在 Next 16 App Router 下会被导航内部覆盖（实测 usr 字段丢失）。
 *
 * sessionStorage 的边界：同标签页、存活到标签关闭；刷新结算页仍能看到本次成绩，
 * 但换标签页/关掉重开就拿不到 —— 那时结算页显示「记录已过期」并指向学习地图。
 */
export const DONE_KEY = 'aotu.doneHandoff';

/** 写入接力数据；隐私模式等写不进去时静默失败（不影响主流程） */
export function writeHandoff(h: DoneHandoff): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(DONE_KEY, JSON.stringify(h));
  } catch {
    /* ignore */
  }
}

/** 读取接力数据；不删除，刷新结算页还能看到本次成绩 */
export function readHandoff(): DoneHandoff | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(DONE_KEY);
    if (!raw) return null;
    const h = JSON.parse(raw) as Partial<DoneHandoff>;
    if (typeof h.stars !== 'number') return null;
    return h as DoneHandoff;
  } catch {
    return null;
  }
}

/**
 * 清除接力数据。
 *
 * 为什么"再玩一次"时必须清：否则重答完若上报失败，结算页会显示上一次的星星，
 * 看起来像"答错了还给满星"。
 */
export function clearHandoff(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(DONE_KEY);
  } catch {
    /* ignore */
  }
}
