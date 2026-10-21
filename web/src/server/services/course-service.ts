import type { Level } from '@/design/tokens';
import type { Course, Unit } from '@/lib/types';
import type { CourseRecord, UnitContent } from '../domain/types';
import { resolveUnitStatuses } from '../domain/rules';
import { ApiError } from '../http/api';
import { getRepository } from '../repositories';
import type { Repository } from '../repositories/types';

const LEVELS: Level[] = ['kids-a', 'kids-b', 'teen', 'adult'];
const DOMAINS: Course['domain'][] = ['phonics', 'words', 'reading', 'speaking', 'business'];

export function parseLevel(value: string | null | undefined): Level | undefined {
  if (!value) return undefined;
  if (!(LEVELS as string[]).includes(value)) {
    throw new ApiError('BAD_REQUEST', `不支持的 level：${value}`);
  }
  return value as Level;
}

export function parseDomain(value: string | null | undefined): Course['domain'] | undefined {
  if (!value) return undefined;
  if (!(DOMAINS as string[]).includes(value)) {
    throw new ApiError('BAD_REQUEST', `不支持的 domain：${value}`);
  }
  return value as Course['domain'];
}

export type UnitSummary = {
  unitId: string;
  index: number;
  level: Level;
  topic: string;
  titleZh: string;
  wordCount: number;
  estMinutes: number;
  questionCount: number;
};

function toSummary(unit: UnitContent): UnitSummary {
  return {
    unitId: unit.unitId,
    index: unit.index,
    level: unit.level,
    topic: unit.topic,
    titleZh: unit.titleZh,
    wordCount: unit.wordCount,
    estMinutes: unit.estMinutes,
    questionCount: unit.questions.length,
  };
}

export async function listCourses(
  query: { level?: string | null; domain?: string | null } = {},
  repo: Repository = getRepository(),
): Promise<{ courses: CourseRecord[] }> {
  const level = parseLevel(query.level);
  const domain = parseDomain(query.domain);
  return { courses: await repo.listCourses({ level, domain }) };
}

export async function getCourseDetail(
  slug: string,
  repo: Repository = getRepository(),
): Promise<{ course: CourseRecord; units: UnitSummary[] }> {
  const course = await repo.findCourse(slug);
  if (!course) throw new ApiError('COURSE_NOT_FOUND', '找不到这门课程');

  const units = await repo.listUnits({ courseSlug: slug });
  return { course, units: units.map(toSummary) };
}

/** 单元完整题目 + 当前学习者的关卡状态 */
export async function getUnitPayload(
  unitId: string,
  learnerId: string,
  repo: Repository = getRepository(),
): Promise<{ unit: Unit }> {
  const unit = await repo.findUnit(unitId);
  if (!unit) throw new ApiError('UNIT_NOT_FOUND', '找不到这一关');

  const learner = await repo.findLearner(learnerId);
  if (!learner) throw new ApiError('LEARNER_NOT_FOUND', '找不到这个学习者');

  const units = await repo.listUnits({ level: learner.level });
  const statuses = resolveUnitStatuses(units, await repo.listProgress(learnerId));

  return {
    unit: {
      unitId: unit.unitId,
      index: unit.index,
      level: unit.level,
      topic: unit.topic,
      titleZh: unit.titleZh,
      wordCount: unit.wordCount,
      estMinutes: unit.estMinutes,
      status: statuses.get(unit.unitId) ?? 'locked',
      questions: unit.questions,
    },
  };
}

/** 课程内单元：先校验归属，避免跨课程拼 unitId */
export async function getCourseUnit(
  slug: string,
  unitId: string,
  learnerId: string,
  repo: Repository = getRepository(),
): Promise<{ unit: Unit }> {
  const course = await repo.findCourse(slug);
  if (!course) throw new ApiError('COURSE_NOT_FOUND', '找不到这门课程');

  const unitIds = await repo.listCourseUnitIds(slug);
  if (!unitIds.includes(unitId)) throw new ApiError('UNIT_NOT_FOUND', '这一关不属于该课程');

  return getUnitPayload(unitId, learnerId, repo);
}
