import type { Level } from '@/design/tokens';
import type { Question, Unit, UnitStatus } from './types';

/**
 * Dify（OU 工作流）产出的单元形状。
 * 与 docs/frontend-plan.md §5.1 的接口契约一致，但**缺少三个运行时字段**，
 * 由后端/前端补齐：index、status、option.imageUrl。
 */
export type DifyOption = {
  id: string;
  imagePrompt?: string;
  imageUrl?: string;
  text?: string;
  correct: boolean;
};

export type DifyQuestion = {
  id: string;
  type: string;
  promptZh: string;
  audioText: string;
  options: DifyOption[];
};

export type DifyUnit = {
  unitId: string;
  level: string;
  topic: string;
  titleZh: string;
  wordCount: number;
  estMinutes: number;
  reviewStatus?: string;
  questionCount?: number;
  questions: DifyQuestion[];
};

export type DifyCourse = {
  courseName: string;
  description: string;
  level: string;
  reviewStatus?: string;
  units: DifyUnit[];
};

/**
 * 前端已实现的题型；其余会降级成占位提示，不会崩。
 *
 * 与 unit-player.tsx 的分发分支一一对应，改一处必须同步另一处。
 * 注意：`cloze` 目前复用 TextChoice 组件渲染（文本框选择），
 * 未来若有真正的填空交互，再拆单独组件。
 */
const IMPLEMENTED_TYPES = new Set([
  'listen_choose_image',
  'tap_to_read',
  'read_choose',
  'cloze',
  'repeat_word',
  'blend_sounds',
  'business_scenario',
]);

export function isImplementedType(type: string): boolean {
  return IMPLEMENTED_TYPES.has(type);
}

/**
 * 把 Dify 产出的单元转成前端 Unit。
 * index / status 由调用方给：它们属于学习者进度，不属于内容。
 */
export function toUnit(
  raw: DifyUnit,
  index: number,
  status: UnitStatus = 'locked',
): Unit {
  const questions: Question[] = raw.questions.map((q) => ({
    id: q.id,
    type: q.type as Question['type'],
    promptZh: q.promptZh,
    audioText: q.audioText,
    options: q.options.map((o) => ({
      id: o.id,
      imagePrompt: o.imagePrompt,
      imageUrl: o.imageUrl,
      text: o.text,
      correct: o.correct,
    })),
  }));

  return {
    unitId: raw.unitId,
    index,
    level: raw.level as Level,
    topic: raw.topic,
    titleZh: raw.titleZh,
    wordCount: raw.wordCount,
    estMinutes: raw.estMinutes,
    status,
    questions,
  };
}

/**
 * 把整个课程转成前端单元列表。
 * 进度规则：前 3 个已完成，第 4 个是当前，其余锁定 —— 与 mock 数据一致，
 * 接入真实进度后换成后端返回值即可。
 */
export function toUnits(course: DifyCourse): Unit[] {
  return course.units.map((u, i) => {
    const status: UnitStatus = i < 3 ? 'done' : i === 3 ? 'current' : 'locked';
    return toUnit(u, i + 1, status);
  });
}
