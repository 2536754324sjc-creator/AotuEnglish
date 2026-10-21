import type { Level } from '@/design/tokens';
import type { Course, Question } from '@/lib/types';

/**
 * 服务端实体。
 * 与前端 lib/types.ts 的区别：内容不带 status，status 由学习者进度实时算出来。
 */

/** 课程目录项。unitCount 是规划总数，publishedUnitCount 是实际已发布数 */
export type CourseRecord = Course & { publishedUnitCount: number };

/** 单元内容。没有 status —— 那是进度，不是内容 */
export type UnitContent = {
  unitId: string;
  index: number;
  level: Level;
  topic: string;
  titleZh: string;
  wordCount: number;
  estMinutes: number;
  questions: Question[];
  reviewed: boolean;
};

/** 课程与单元的多对多关联 */
export type CourseUnitLink = { courseSlug: string; unitId: string };

export type LearnerRecord = {
  id: string;
  name: string;
  level: Level;
  starsGoal: number;
  /** 历史累计星数基数，starTotal = starsBase + 已完成单元星数 */
  starsBase: number;
  createdAt: string;
};

export type UnitProgressRecord = {
  learnerId: string;
  unitId: string;
  /** 历史最好成绩，重玩不降级 */
  stars: number;
  attempts: number;
  /** 首次完成时间；重玩不覆盖，避免重复计入「今日」 */
  completedAt: string;
};

export type SessionAnswerRecord = {
  questionId: string;
  selectedOptionId: string;
  correct: boolean;
  attempts: number;
};

export type PracticeSessionRecord = {
  id: string;
  learnerId: string;
  unitId: string;
  clientSessionId: string;
  stars: number;
  totalQuestions: number;
  correctFirstTry: number;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
  answers: SessionAnswerRecord[];
};

export type WeakSoundRecord = {
  learnerId: string;
  sound: string;
  noteZh: string;
};

/** 仓储初始化数据 */
export type SeedData = {
  courses: CourseRecord[];
  units: UnitContent[];
  courseUnits: CourseUnitLink[];
  learners: LearnerRecord[];
  progress: UnitProgressRecord[];
  sessions: PracticeSessionRecord[];
  weakSounds: WeakSoundRecord[];
};
