import type { Question, UnitStatus } from '@/lib/types';
import type { UnitContent, UnitProgressRecord } from './types';

/** 提交上来的一条作答（不含 correct，正确答案以题库为准） */
export type SubmitAnswer = {
  questionId: string;
  selectedOptionId: string;
  attempts: number;
};

export type ScoreResult = {
  stars: number;
  totalQuestions: number;
  correctFirstTry: number;
  correctAnswers: number;
  accuracy: number;
};

/**
 * 星星口径：全对 3 星；首次答对 ≥ 70% 2 星；其余 1 星。
 * 单独导出，供历史数据与测试复用。
 */
export function starsFor(correctFirstTry: number, totalQuestions: number): number {
  if (totalQuestions > 0 && correctFirstTry === totalQuestions) return 3;
  const ratio = totalQuestions === 0 ? 0 : correctFirstTry / totalQuestions;
  return ratio >= 0.7 ? 2 : 1;
}

/**
 * 服务端权威计分。
 * 正确答案以题库里的 correct 为准，忽略客户端提交的正确性判断。
 */
export function scoreSubmission(questions: Question[], answers: SubmitAnswer[]): ScoreResult {
  const byQuestion = new Map(answers.map((answer) => [answer.questionId, answer]));
  let correctFirstTry = 0;
  let correctAnswers = 0;

  for (const question of questions) {
    const answer = byQuestion.get(question.id);
    const selected = question.options.find((option) => option.id === answer?.selectedOptionId);
    if (!selected?.correct) continue;
    correctAnswers += 1;
    if (answer?.attempts === 1) correctFirstTry += 1;
  }

  const totalQuestions = questions.length;
  const accuracy = totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);
  const stars = starsFor(correctFirstTry, totalQuestions);

  return { stars, totalQuestions, correctFirstTry, correctAnswers, accuracy };
}

/**
 * 关卡状态：有记录 = done；第一个没记录的 = current；其余 locked。
 * 同一内容档内的单元按 index 升序。
 */
export function resolveUnitStatuses(
  units: UnitContent[],
  progress: UnitProgressRecord[],
): Map<string, UnitStatus> {
  const done = new Set(progress.map((item) => item.unitId));
  const ordered = [...units].sort((a, b) => a.index - b.index);
  const firstUnfinished = ordered.find((unit) => !done.has(unit.unitId))?.unitId;

  const statuses = new Map<string, UnitStatus>();
  for (const unit of ordered) {
    if (done.has(unit.unitId)) statuses.set(unit.unitId, 'done');
    else statuses.set(unit.unitId, unit.unitId === firstUnfinished ? 'current' : 'locked');
  }
  return statuses;
}

/** 每 starsPerChest 关一个宝箱，返回还差几关，1..starsPerChest */
export function chestRemaining(doneCount: number, starsPerChest: number): number {
  if (starsPerChest <= 0) return 0;
  return starsPerChest - (doneCount % starsPerChest);
}
