'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type { AnswerReport, Question, Unit } from '@/lib/types';
import { buildAnswerReport } from '@/lib/answer-report';
import { api } from '@/lib/api';

/**
 * 答题状态机 —— 与界面解耦，纯逻辑。
 *
 * 规则（来自规划文档 §7.3）：
 * - 答错不扣星、不判负，允许重试；同一题第二次答错给出提示。
 * - 星星按「一次答对」的数量折算，最高 3 星。
 * - 中途退出即丢弃本单元进度。
 */

export type Phase = 'asking' | 'correct' | 'wrong';

export type AnswerState = {
  /** 当前题索引 */
  index: number;
  /** 当前阶段 */
  phase: Phase;
  /** 当前题已选的选项 id */
  selected: string | null;
  /** 当前题已尝试次数 */
  attempts: number;
  /** 是否在重试：答错过、尚未检查新答案，用来保持提示文案 */
  retrying: boolean;
  /** 一次答对的题数 */
  firstTryCount: number;
  /** 每题是否一次答对，用于结算页回看 */
  results: boolean[];
  /** 是否已答完全部题目 */
  finished: boolean;
};

type Action =
  | { type: 'select'; optionId: string }
  /** 判分结果由调用方（答题机 hook）裁决后一并传入 */
  | { type: 'check'; correct: boolean }
  | { type: 'next' }
  | { type: 'reset' };

function initialState(unit: Unit): AnswerState {
  return {
    index: 0,
    phase: 'asking',
    selected: null,
    attempts: 0,
    retrying: false,
    firstTryCount: 0,
    results: unit.questions.map(() => false),
    finished: false,
  };
}

/**
 * 把「这一题判对/判错」结算进状态。
 *
 * 为什么抽出来：判分结果现在来自服务端（live）或本地（mock），
 * 但结算规则必须完全一致，否则两种模式下星星口径会不同。
 */
function settle(state: AnswerState, question: Question | undefined, correct: boolean): AnswerState {
  if (state.phase === 'correct' || !state.selected || !question) return state;

  const attempts = state.attempts + 1;

  if (correct) {
    const firstTry = attempts === 1;
    const results = [...state.results];
    results[state.index] = firstTry;
    return {
      ...state,
      phase: 'correct',
      attempts,
      retrying: false,
      results,
      firstTryCount: state.firstTryCount + (firstTry ? 1 : 0),
    };
  }

  // 答错：清掉选择，允许重选
  return { ...state, phase: 'wrong', attempts, selected: null, retrying: true };
}

function reducer(unit: Unit) {
  return function reduce(state: AnswerState, action: Action): AnswerState {
    const question = unit.questions[state.index];

    switch (action.type) {
      case 'select': {
        // 答对后锁定；答错后允许重选，retrying 保留提示文案
        if (state.phase === 'correct') return state;
        return {
          ...state,
          phase: 'asking',
          selected: action.optionId,
          retrying: state.attempts > 0,
        };
      }

      case 'check': {
        // 判分结果由外部传入（服务端判分模式下，reducer 自己拿不到答案）
        if (state.phase === 'correct' || !action.correct) {
          return settle(state, question, false);
        }
        return settle(state, question, true);
      }

      case 'next': {
        const isLast = state.index >= unit.questions.length - 1;
        if (isLast) {
          return { ...state, finished: true, phase: 'asking' };
        }
        return {
          ...state,
          index: state.index + 1,
          phase: 'asking',
          selected: null,
          attempts: 0,
          retrying: false,
        };
      }

      case 'reset':
        return initialState(unit);

      default:
        return state;
    }
  };
}

export function useAnswerMachine(unit: Unit) {
  const reduce = useMemo(() => reducer(unit), [unit]);
  const [state, dispatch] = useReducer(reduce, unit, initialState);

  const question: Question | undefined = unit.questions[state.index];

  /* ---------- 上报用的计时与尝试次数（契约 §4.6） ---------- */

  // 每题的最终尝试次数、耗时与最终选项，按题目索引存
  const attemptsByIndex = useRef<number[]>([]);
  const elapsedByIndex = useRef<number[]>([]);
  // 每题答对时选中的选项 id —— 服务端判分需要它（契约 §10 第 5 条：不再下发答案）
  const optionByIndex = useRef<string[]>([]);
  // 整关开始时间（保持 mount 时的值，跨轮次不变）
  const startedAtRef = useRef<string>(new Date().toISOString());
  // 当前题开始计时的时间戳；切换题目时重置
  const questionStartRef = useRef<number>(Date.now());

  // 换题时结算上一题的耗时，并给新题重新开始计时
  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [state.index]);

  const select = useCallback((optionId: string) => dispatch({ type: 'select', optionId }), []);

  /**
   * 判分并结算当前题。
   *
   * 两种模式的区别只在这里：
   * - live：单元不含答案，问服务端（POST /units/:id/check）
   * - mock：本地就有 correct，直接判
   * 结算逻辑两者共用 settle()，保证星星口径一致。
   *
   * 失败处理：网络错误时**不判错**（不冤枉孩子），回到可重试状态。
   */
  const checkingRef = useRef(false);
  const check = useCallback(async (): Promise<void> => {
    if (checkingRef.current) return; // 防连点导致重复计次
    if (state.phase === 'correct' || !state.selected || !question) return;

    const selected = state.selected;
    checkingRef.current = true;
    try {
      let correct: boolean;
      const server = await api.checkAnswer(unit.unitId, question.id, selected);
      if (server) {
        correct = server.correct;
      } else {
        // mock 模式：使用本地答案
        correct = Boolean(question.options.find((o) => o.id === selected)?.correct);
      }
      dispatch({ type: 'check', correct });
    } catch {
      // 判分请求失败：不算这一次尝试，允许学生重按
      dispatch({ type: 'select', optionId: selected });
    } finally {
      checkingRef.current = false;
    }
  }, [state.phase, state.selected, question, unit.unitId]);

  const next = useCallback(() => dispatch({ type: 'next' }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  /** 3 星按一次答对比例折算：全对 3 星，≥70% 2 星，其余 1 星 */
  const stars = useMemo(() => {
    const total = unit.questions.length;
    if (total === 0) return 1;
    const ratio = state.firstTryCount / total;
    if (ratio >= 1) return 3;
    if (ratio >= 0.7) return 2;
    return 1;
  }, [state.firstTryCount, unit.questions.length]);

  // 题目作答完成时落一次快照：答对的那次 reducer 的 attempts 就是最终值
  useEffect(() => {
    if (state.phase !== 'correct') return;
    const i = state.index;
    attemptsByIndex.current[i] = state.attempts;
    elapsedByIndex.current[i] = Math.max(0, Date.now() - questionStartRef.current);
    if (state.selected) optionByIndex.current[i] = state.selected;
  }, [state.phase, state.index, state.attempts, state.selected]);

  /**
   * 生成整关的上报载荷。
   *
   * 只用 ref 里的快照，不依赖 state —— 调用时机在「最后一题答对之后」，
   * 此时 reducer 早已把该题写进 results，快照也已经落好。
   * 没走到 / 没答完的题按 attempts=0、correct=false 提交，服务端据此判未完成。
   */
  const getReport = useCallback(
    (): AnswerReport =>
      buildAnswerReport(
        unit,
        attemptsByIndex.current,
        elapsedByIndex.current,
        startedAtRef.current,
        new Date().toISOString(),
        optionByIndex.current,
      ),
    [unit],
  );

  /** 结算是「一次答对」之后才允许，避免误判 */
  const canCheck = state.phase === 'asking' && state.selected !== null;
  const showRetryHint = state.retrying;

  return {
    state,
    question,
    total: unit.questions.length,
    current: state.index + 1,
    canCheck,
    showRetryHint,
    stars,
    getReport,
    select,
    check,
    next,
    reset,
  };
}
