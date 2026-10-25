import type { AnswerReport, CollectedAnswer, Unit } from './types';

/**
 * 把答题过程中的统计快照转成上报载荷（契约 §4.6 的 `answers`）。
 *
 * 为什么单独抽成纯函数：这是周报「薄弱项」的唯一数据来源，
 * 算错了家长端就会看到错误的薄弱项。纯函数不依赖 React，可以直接单元测试。
 *
 * 口径：
 * - `attempts` 为 0 表示这题没答完（中途退出），服务端据此判未完成
 * - `correct` 以「这题最终答对」为准，与试了几次无关
 * - `elapsedMs` 为 -1 表示耗时未知，不参与统计
 */
export function buildAnswerReport(
  unit: Unit,
  attemptsByIndex: readonly number[],
  elapsedByIndex: readonly number[],
  startedAt: string,
  finishedAt: string,
  optionsByIndex: readonly string[] = [],
): AnswerReport {
  const answers: CollectedAnswer[] = unit.questions.map((q, i) => {
    const attempts = attemptsByIndex[i] ?? 0;
    return {
      questionId: q.id,
      // 客户端仍上报自己的判断，服务端**不采信**（以 optionId 重新判分），
      // 保留它是为了在日志里比对「客户端认为的对错」与「服务端判定的对错」
      correct: attempts > 0,
      attempts,
      elapsedMs: elapsedByIndex[i] ?? -1,
      optionId: optionsByIndex[i],
    };
  });

  return { startedAt, finishedAt, answers };
}
