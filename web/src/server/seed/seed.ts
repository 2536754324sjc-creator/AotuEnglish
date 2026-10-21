import { serverConfig } from '../config';
import { starsFor } from '../domain/rules';
import { addDays, isoWeekKey, localDateKey, weekDayKeys } from '../domain/time';
import type {
  CourseUnitLink,
  LearnerRecord,
  PracticeSessionRecord,
  SeedData,
  UnitContent,
  UnitProgressRecord,
} from '../domain/types';
import { mockCourses, mockTodayProgress, mockWeeklyReport } from '@/lib/mock-data';

/**
 * P0 种子数据：把现有 mock 数据翻译成服务端实体。
 * P1 落库后这份文件只用于本地开发与测试。
 */

/** 历史累计星数基数：128 - 3 个已完成单元 × 3 星 */
const STARS_BASE = 119;

/** 一周内用于验证周报聚合的练习记录（分钟 / 题数 / 首次答对数） */
const SESSION_SEEDS = [
  { unitId: 'kids-a-greetings', minutes: 12, totalQuestions: 6, correctFirstTry: 6 },
  { unitId: 'kids-a-colors', minutes: 16, totalQuestions: 6, correctFirstTry: 5 },
  { unitId: 'kids-a-animals', minutes: 9, totalQuestions: 6, correctFirstTry: 6 },
  { unitId: 'kids-a-numbers', minutes: 18, totalQuestions: 6, correctFirstTry: 4 },
  { unitId: 'kids-a-my-family', minutes: 13, totalQuestions: 6, correctFirstTry: 5 },
];

function toUnitContents(): UnitContent[] {
  return mockTodayProgress.units.map((unit) => {
    const { status: _status, ...content } = unit;
    return { ...content, reviewed: true };
  });
}

function buildCourseUnits(units: UnitContent[]): CourseUnitLink[] {
  const links: CourseUnitLink[] = [];
  for (const course of mockCourses) {
    for (const unit of units) {
      // 临时关联：同内容档的单元挂到该档课程下，P3 用真实 course_unit 替换
      if (unit.level === course.level) {
        links.push({ courseSlug: course.slug, unitId: unit.unitId });
      }
    }
  }
  return links;
}

function buildSessions(
  learnerId: string,
  now: Date,
): PracticeSessionRecord[] {
  const todayKey = localDateKey(now, serverConfig.timeZone);
  const days = weekDayKeys(isoWeekKey(todayKey))?.filter((day) => day <= todayKey) ?? [];
  const recentDays = days.slice(-SESSION_SEEDS.length);

  return recentDays.map((dayKey, index) => {
    const seed = SESSION_SEEDS[index];
    return {
      id: `seed-session-${index + 1}`,
      learnerId,
      unitId: seed.unitId,
      clientSessionId: `seed-${dayKey}-${seed.unitId}`,
      stars: starsFor(seed.correctFirstTry, seed.totalQuestions),
      totalQuestions: seed.totalQuestions,
      correctFirstTry: seed.correctFirstTry,
      durationMs: seed.minutes * 60_000,
      startedAt: `${dayKey}T11:50:00.000Z`,
      finishedAt: `${dayKey}T12:00:00.000Z`,
      answers: [],
    };
  });
}

export function buildSeedData(now: Date = new Date()): SeedData {
  const units = toUnitContents();
  const courseUnits = buildCourseUnits(units);
  const todayKey = localDateKey(now, serverConfig.timeZone);

  const learner: LearnerRecord = {
    id: 'learner-mia',
    name: mockTodayProgress.learnerName,
    level: mockTodayProgress.level,
    starsGoal: mockTodayProgress.starsGoal,
    starsBase: STARS_BASE,
    createdAt: now.toISOString(),
  };

  const doneUnits = mockTodayProgress.units.filter((unit) => unit.status === 'done');
  const progress: UnitProgressRecord[] = doneUnits.map((unit, index) => ({
    learnerId: learner.id,
    unitId: unit.unitId,
    stars: 3,
    attempts: 1,
    // 最后一个已完成单元记为今天，保证「今日 3 星」与 mock 一致
    completedAt:
      index === doneUnits.length - 1
        ? now.toISOString()
        : `${addDays(todayKey, index - doneUnits.length + 1)}T12:00:00.000Z`,
  }));

  return {
    courses: mockCourses.map((course) => ({
      ...course,
      publishedUnitCount: courseUnits.filter((link) => link.courseSlug === course.slug).length,
    })),
    units,
    courseUnits,
    learners: [learner],
    progress,
    sessions: buildSessions(learner.id, now),
    weakSounds: mockWeeklyReport.weakSounds.map((item) => ({
      learnerId: learner.id,
      sound: item.sound,
      noteZh: item.noteZh,
    })),
  };
}
