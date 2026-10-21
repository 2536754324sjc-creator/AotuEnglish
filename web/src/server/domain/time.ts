/**
 * 日期与 ISO 周工具。
 * 全部以 `YYYY-MM-DD` 字符串为准，避免把本地时间塞进 Date 再比较。
 * 「本地」指 serverConfig.timeZone。
 */

const MS_PER_DAY = 86_400_000;
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

/** 把一个时间点按指定时区转成 YYYY-MM-DD */
export function localDateKey(date: Date, timeZone: string): string {
  const parts = getFormatter(timeZone).formatToParts(date);
  const pick = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${pick('year')}-${pick('month')}-${pick('day')}`;
}

export function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

function toUtcDate(dayKey: string): Date {
  const [y, m, d] = dayKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fromUtcDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(dayKey: string, delta: number): string {
  const date = toUtcDate(dayKey);
  date.setUTCDate(date.getUTCDate() + delta);
  return fromUtcDate(date);
}

/** 周一为一周起点 */
export function startOfWeek(dayKey: string): string {
  const date = toUtcDate(dayKey);
  const mondayOffset = (date.getUTCDay() + 6) % 7;
  return addDays(dayKey, -mondayOffset);
}

/** YYYY-Www（ISO 8601） */
export function isoWeekKey(dayKey: string): string {
  const date = toUtcDate(dayKey);
  const mondayOffset = (date.getUTCDay() + 6) % 7;
  const thursday = new Date(date);
  thursday.setUTCDate(date.getUTCDate() - mondayOffset + 3);

  const firstThursday = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4));
  const firstOffset = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstOffset + 3);

  const week = 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * MS_PER_DAY));
  return `${thursday.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function currentWeekKey(now: Date, timeZone: string): string {
  return isoWeekKey(localDateKey(now, timeZone));
}

export function parseWeekKey(weekKey: string): { year: number; week: number } | null {
  const match = /^(\d{4})-W(\d{2})$/.exec(weekKey);
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  if (week < 1 || week > 53) return null;
  return { year, week };
}

/**
 * 某一 ISO 周的 7 个本地日（周一 → 周日）。
 * 周键不合法（如某年只有 52 周却传 W53）返回 null。
 */
export function weekDayKeys(weekKey: string): string[] | null {
  const parsed = parseWeekKey(weekKey);
  if (!parsed) return null;

  const jan4 = fromUtcDate(new Date(Date.UTC(parsed.year, 0, 4)));
  const firstMonday = startOfWeek(jan4);
  const start = addDays(firstMonday, (parsed.week - 1) * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  // W53 落在下一年时，这一周其实不存在
  return isoWeekKey(days[0]) === weekKey ? days : null;
}

/** 10/19 */
export function dayMonthLabel(dayKey: string): string {
  const [, m, d] = dayKey.split('-');
  return `${Number(m)}/${Number(d)}`;
}

/** 10/19–10/25 */
export function weekLabel(days: string[]): string {
  return `${dayMonthLabel(days[0])}–${dayMonthLabel(days[days.length - 1])}`;
}

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

/** 一 … 日 */
export function weekdayLabel(dayKey: string): string {
  return WEEKDAY_LABELS[(toUtcDate(dayKey).getUTCDay() + 6) % 7];
}

/**
 * 连续活跃天数：从 dayKeys 中最后一个有活动的日子往前数，
 * 遇到没有活动的一天就停。无活动返回 0。
 */
export function consecutiveDays(dayKeys: string[], activeDays: ReadonlySet<string>): number {
  let lastActive = -1;
  for (let i = dayKeys.length - 1; i >= 0; i -= 1) {
    if (activeDays.has(dayKeys[i])) {
      lastActive = i;
      break;
    }
  }
  if (lastActive < 0) return 0;

  let streak = 0;
  for (let i = lastActive; i >= 0; i -= 1) {
    if (!activeDays.has(dayKeys[i])) break;
    streak += 1;
  }
  return streak;
}
