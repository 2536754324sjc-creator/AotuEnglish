import type {
  CourseRecord,
  LearnerRecord,
  PracticeSessionRecord,
  SeedData,
  UnitContent,
  UnitProgressRecord,
  WeakSoundRecord,
} from '../domain/types';
import type { CourseFilter, Repository, UnitFilter } from './types';

function clone<T>(value: T): T {
  return structuredClone(value);
}

/**
 * 内存仓储。P0 用它跑通接口与测试，进程重启数据归零。
 * 真实持久化在 P1 实现同一个 Repository 接口。
 */
export function createMemoryRepository(seed: SeedData): Repository {
  let courses: CourseRecord[] = [];
  let units: UnitContent[] = [];
  let courseUnits: SeedData['courseUnits'] = [];
  let learners = new Map<string, LearnerRecord>();
  let progress: UnitProgressRecord[] = [];
  let sessions: PracticeSessionRecord[] = [];
  let weakSounds: WeakSoundRecord[] = [];

  function reset(data: SeedData): void {
    courses = clone(data.courses);
    units = clone(data.units);
    courseUnits = clone(data.courseUnits);
    learners = new Map(data.learners.map((learner) => [learner.id, clone(learner)]));
    progress = clone(data.progress);
    sessions = clone(data.sessions);
    weakSounds = clone(data.weakSounds);
  }

  reset(seed);

  return {
    async listCourses(filter: CourseFilter = {}) {
      return courses
        .filter((course) => !filter.level || course.level === filter.level)
        .filter((course) => !filter.domain || course.domain === filter.domain)
        .map(clone);
    },

    async findCourse(slug: string) {
      const course = courses.find((item) => item.slug === slug);
      return course ? clone(course) : null;
    },

    async listUnits(filter: UnitFilter = {}) {
      let pool = units;

      if (filter.courseSlug) {
        const linked = new Set(
          courseUnits
            .filter((link) => link.courseSlug === filter.courseSlug)
            .map((link) => link.unitId),
        );
        pool = pool.filter((unit) => linked.has(unit.unitId));
      }

      if (filter.level) {
        pool = pool.filter((unit) => unit.level === filter.level);
      }

      return [...pool].sort((a, b) => a.index - b.index).map(clone);
    },

    async findUnit(unitId: string) {
      const unit = units.find((item) => item.unitId === unitId);
      return unit ? clone(unit) : null;
    },

    async listCourseUnitIds(courseSlug: string) {
      return courseUnits
        .filter((link) => link.courseSlug === courseSlug)
        .map((link) => link.unitId);
    },

    async findLearner(id: string) {
      const learner = learners.get(id);
      return learner ? clone(learner) : null;
    },

    async listProgress(learnerId: string) {
      return progress.filter((item) => item.learnerId === learnerId).map(clone);
    },

    async saveProgress(record: UnitProgressRecord) {
      const index = progress.findIndex(
        (item) => item.learnerId === record.learnerId && item.unitId === record.unitId,
      );
      if (index >= 0) progress[index] = clone(record);
      else progress.push(clone(record));
    },

    async findSessionByClientId(learnerId: string, clientSessionId: string) {
      const session = sessions.find(
        (item) => item.learnerId === learnerId && item.clientSessionId === clientSessionId,
      );
      return session ? clone(session) : null;
    },

    async insertSession(record: PracticeSessionRecord) {
      sessions.push(clone(record));
    },

    async listSessions(learnerId: string) {
      return sessions
        .filter((item) => item.learnerId === learnerId)
        .sort((a, b) => a.finishedAt.localeCompare(b.finishedAt))
        .map(clone);
    },

    async listWeakSounds(learnerId: string) {
      return weakSounds.filter((item) => item.learnerId === learnerId).map(clone);
    },

    reset,
  };
}
