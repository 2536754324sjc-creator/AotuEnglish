import type { TodayProgress } from '@/lib/types';
import { serverConfig } from '../config';
import { chestRemaining, resolveUnitStatuses } from '../domain/rules';
import { localDateKey } from '../domain/time';
import { ApiError } from '../http/api';
import { getRepository } from '../repositories';
import type { Repository } from '../repositories/types';

/**
 * 今日任务快照。形状与前端 TodayProgress 完全一致，
 * 前端接后端时可以整段替换 mockTodayProgress。
 */
export async function getTodayProgress(
  learnerId: string,
  repo: Repository = getRepository(),
  now: Date = new Date(),
): Promise<TodayProgress> {
  const learner = await repo.findLearner(learnerId);
  if (!learner) throw new ApiError('LEARNER_NOT_FOUND', '找不到这个学习者');

  const units = await repo.listUnits({ level: learner.level });
  const progress = await repo.listProgress(learnerId);
  const statuses = resolveUnitStatuses(units, progress);

  const todayKey = localDateKey(now, serverConfig.timeZone);
  const starsToday = progress
    .filter((item) => localDateKey(new Date(item.completedAt), serverConfig.timeZone) === todayKey)
    .reduce((sum, item) => sum + item.stars, 0);

  const starTotal = learner.starsBase + progress.reduce((sum, item) => sum + item.stars, 0);
  const current = units.find((unit) => statuses.get(unit.unitId) === 'current');
  const lastIndex = units.length > 0 ? units[units.length - 1].index : 0;

  return {
    learnerName: learner.name,
    level: learner.level,
    starsToday,
    starsGoal: learner.starsGoal,
    starTotal,
    currentUnitIndex: current?.index ?? lastIndex + 1,
    chestRemaining: chestRemaining(progress.length, serverConfig.starsPerChest),
    units: units.map((unit) => ({
      unitId: unit.unitId,
      index: unit.index,
      level: unit.level,
      topic: unit.topic,
      titleZh: unit.titleZh,
      wordCount: unit.wordCount,
      estMinutes: unit.estMinutes,
      status: statuses.get(unit.unitId) ?? 'locked',
      questions: unit.questions,
    })),
  };
}
