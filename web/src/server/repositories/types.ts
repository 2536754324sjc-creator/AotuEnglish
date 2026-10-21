import type { Level } from '@/design/tokens';
import type { Course } from '@/lib/types';
import type {
  CourseRecord,
  LearnerRecord,
  PracticeSessionRecord,
  SeedData,
  UnitContent,
  UnitProgressRecord,
  WeakSoundRecord,
} from '../domain/types';

export type CourseFilter = {
  level?: Level;
  domain?: Course['domain'];
};

export type UnitFilter = {
  level?: Level;
  courseSlug?: string;
};

/**
 * 唯一存取契约。P0 是内存实现，P1 换 SQL 时 service 不改。
 * 全部异步，避免实现更换时改签名。
 */
export interface Repository {
  listCourses(filter?: CourseFilter): Promise<CourseRecord[]>;
  findCourse(slug: string): Promise<CourseRecord | null>;

  listUnits(filter?: UnitFilter): Promise<UnitContent[]>;
  findUnit(unitId: string): Promise<UnitContent | null>;
  listCourseUnitIds(courseSlug: string): Promise<string[]>;

  findLearner(id: string): Promise<LearnerRecord | null>;

  listProgress(learnerId: string): Promise<UnitProgressRecord[]>;
  saveProgress(record: UnitProgressRecord): Promise<void>;

  findSessionByClientId(
    learnerId: string,
    clientSessionId: string,
  ): Promise<PracticeSessionRecord | null>;
  insertSession(record: PracticeSessionRecord): Promise<void>;
  listSessions(learnerId: string): Promise<PracticeSessionRecord[]>;

  listWeakSounds(learnerId: string): Promise<WeakSoundRecord[]>;

  /** 仅供测试与重建种子数据 */
  reset?(data: SeedData): void;
}
