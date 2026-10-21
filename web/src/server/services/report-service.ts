import type { ReportRow, WeeklyReport } from '@/lib/types';
import { serverConfig } from '../config';
import {
  consecutiveDays,
  currentWeekKey,
  localDateKey,
  weekDayKeys,
  weekLabel,
  weekdayLabel,
} from '../domain/time';
import { ApiError } from '../http/api';
import { getRepository } from '../repositories';
import type { Repository } from '../repositories/types';

export type WeeklyReportPayload = WeeklyReport & {
  week: string;
  rows: ReportRow[];
};

/**
 * 周报聚合：全部从练习记录现算，不落汇总表。
 * week 缺省为当前 ISO 周；零数据返回全 0 与空数组，由前端渲染空态。
 */
export async function getWeeklyReport(
  learnerId: string,
  week?: string | null,
  repo: Repository = getRepository(),
  now: Date = new Date(),
): Promise<WeeklyReportPayload> {
  const learner = await repo.findLearner(learnerId);
  if (!learner) throw new ApiError('LEARNER_NOT_FOUND', '找不到这个学习者');

  const timedWeek = week?.trim();
  const weekKey = timedWeek || currentWeekKey(now, serverConfig.timeZone);
  const days = weekDayKeys(weekKey);

  if (!days) {
    throw new ApiError('BAD_REQUEST', `week 格式不合法：${weekKey}，应为 YYYY-Www`);
  }

  const dayKeys = new Set(days);
  const sessions = (await repo.listSessions(learnerId)).filter((session) =>
    dayKeys.has(localDateKey(new Date(session.finishedAt), serverConfig.timeZone)),
  );

  const units = await repo.listUnits({ level: learner.level });
  const unitTitles = new Map(units.map((unit) => [unit.unitId, unit.titleZh]));
  const progress = await repo.listProgress(learnerId);

  const minutesByDay = new Map<string, number>();
  for (const session of sessions) {
    const dayKey = localDateKey(new Date(session.finishedAt), serverConfig.timeZone);
    minutesByDay.set(dayKey, (minutesByDay.get(dayKey) ?? 0) + Math.round(session.durationMs / 60_000));
  }

  const rows: ReportRow[] = sessions.map((session) => {
    const dayKey = localDateKey(new Date(session.finishedAt), serverConfig.timeZone);
    return {
      day: dayKey.slice(5).replace('-', '/'),
      unit: unitTitles.get(session.unitId) ?? session.unitId,
      questions: session.totalQuestions,
      accuracy:
        session.totalQuestions === 0
          ? 0
          : Math.round((session.correctFirstTry / session.totalQuestions) * 100),
      minutes: Math.round(session.durationMs / 60_000),
    };
  });

  const mastery = new Map<string, { correct: number; total: number }>();
  for (const session of sessions) {
    const current = mastery.get(session.unitId) ?? { correct: 0, total: 0 };
    current.correct += session.correctFirstTry;
    current.total += session.totalQuestions;
    mastery.set(session.unitId, current);
  }

  const unitMastery = [...mastery.entries()]
    .map(([unitId, value]) => ({
      unit: unitTitles.get(unitId) ?? unitId,
      percent: value.total === 0 ? 0 : Math.round((value.correct / value.total) * 100),
    }))
    .sort((a, b) => b.percent - a.percent);

  const completedInWeek = progress.filter((item) => {
    const dayKey = localDateKey(new Date(item.completedAt), serverConfig.timeZone);
    return dayKeys.has(dayKey);
  }).length;

  return {
    week: weekKey,
    weekLabel: weekLabel(days),
    minutes: Math.round(sessions.reduce((sum, item) => sum + item.durationMs, 0) / 60_000),
    unitsDone: completedInWeek,
    unitsTotal: units.length,
    streakDays: consecutiveDays(days, new Set(minutesByDay.keys())),
    dailyMinutes: days.map((dayKey) => ({
      day: weekdayLabel(dayKey),
      minutes: minutesByDay.get(dayKey) ?? 0,
    })),
    weakSounds: (await repo.listWeakSounds(learnerId)).slice(0, 3).map((item) => ({
      sound: item.sound,
      noteZh: item.noteZh,
    })),
    unitMastery,
    rows,
  };
}
