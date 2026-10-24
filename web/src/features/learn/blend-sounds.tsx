'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Option } from '@/lib/types';
import { speak as speakText, stopSpeaking, type SpeakState } from '@/lib/speak';
import styles from './blend-sounds.module.css';

/**
 * 拼读题（blend_sounds）。
 *
 * 交互：给出一串音素磁贴（c-a-t），逐个点听，再拼成完整单词。
 *
 * 数据约定（与契约一致）：
 * - `audioText` 是完整单词，如 "cat"
 * - `options[].text` 是音素，按顺序排列，如 ["c", "a", "t"]
 * - `options[].correct` 只用于**提交时**告诉状态机哪个 id 算对，
 *   不参与答案推导（答案永远是 audioText）
 *
 * 实现说明：拼读题的「答案」不是选一个选项，而是要拼对顺序。
 * 所以把 options 当作**字母磁贴**，用户按顺序点，
 * 拼出的字符串与 `audioText` 比较。
 *
 * 为什么允许重复点击同一个字母：
 * 像 "book" / "see" 这种有重复字母的词，磁贴只出现一次，
 * 用户需要点两次 o 才能拼出 "oo"——所以不能把已点的磁贴禁用。
 */

type Props = {
  options: Option[];
  audioText: string;
  selected: string | null;
  disabled: boolean;
  onSelect: (optionId: string) => void;
};

export function BlendSounds({ options, audioText, selected, disabled, onSelect }: Props) {
  const [speakState, setSpeakState] = useState<SpeakState>('idle');
  const [picked, setPicked] = useState<string[]>([]);
  // 正在播哪个音素（用于高亮）
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  const speaking = speakState === 'playing';

  /**
   * 正确答案永远是 `audioText`（要拼的词）。
   *
   * 为什么不用 options 推：options 是**可选的字母磁贴**，
   * 其中标 `correct: true` 的那个只表示「这是正确答案里出现过的字母」，
   * 不是完整拼写（拼 "cat" 时三个字母都会被标）。
   * 早期版本用 `options.filter(correct).join('')` 推，会得到 "c" 这种错答案。
   */
  const target = audioText;

  /** 用于提交给状态机的选项：优先选 correct 的那个，没有就取第一个 */
  const answerOption = useMemo(
    () => options.find((o) => o.correct) ?? options[0],
    [options],
  );

  useEffect(() => () => stopSpeaking(), []);

  const playText = useCallback((text: string, idx: number | null = null) => {
    if (!text) return;
    setPlayingIdx(idx);
    speakText({
      text,
      rate: 0.7,
      onStateChange: (s) => {
        setSpeakState(s);
        if (s === 'idle') setPlayingIdx(null);
      },
    });
  }, []);

  // 点磁贴：加进已拼的序列
  const pickTile = useCallback(
    (opt: Option, idx: number) => {
      if (disabled) return;
      setPicked((prev) => {
        const next = [...prev, opt.text ?? ''];
        return next;
      });
      // 点一下先听这个音
      if (opt.text) playText(opt.text, idx);
    },
    [disabled, playText],
  );

  // 撤销最后一步
  const undo = useCallback(() => {
    if (disabled) return;
    setPicked((prev) => prev.slice(0, -1));
  }, [disabled]);

  // 清空
  const clear = useCallback(() => {
    if (disabled) return;
    setPicked([]);
  }, [disabled]);

  const spelled = picked.join('');

  const [wrongHint, setWrongHint] = useState(false);

  /**
   * 拼对才提交：
   * 拼对了把正确答案的 option id 交给状态机（用户再点「检查一下」即可判对）；
   * 拼错了不清空 —— 清空会让人不知道错在哪，保留下来更利于学习。
   */
  const handleCheck = useCallback(() => {
    if (disabled || !answerOption) return;

    if (spelled === target) {
      onSelect(answerOption.id);
    } else {
      setWrongHint(true);
      window.setTimeout(() => setWrongHint(false), 1800);
    }
  }, [disabled, spelled, target, answerOption, onSelect]);

  return (
    <div className={styles.wrap}>
      {/* 目标词的发声入口 */}
      <button
        type="button"
        className={`${styles.listen} ${speaking ? styles.speaking : ''}`}
        onClick={() => playText(audioText)}
        aria-label="听一听要拼的词"
      >
        <svg aria-hidden="true">
          <use href="#i-sound" />
        </svg>
        听一听
      </button>

      {/* 拼出来的结果 */}
      <div
        className={`${styles.result} ${wrongHint ? styles.resultWrong : ''}`}
        aria-live="polite"
        aria-label={`已拼出 ${spelled || '空'}`}
      >
        {picked.length === 0 ? (
          <span className={styles.placeholder}>点下面的字母拼出来</span>
        ) : (
          picked.map((ch, i) => {
            // 逐位比对：拼错的字母标红，孩子不用等提交就知道哪一位不对
            const isRight = ch === target[i];
            return (
              <span
                key={`${ch}-${i}`}
                className={`${styles.letter} ${isRight ? styles.letterOk : styles.letterBad}`}
              >
                {ch}
              </span>
            );
          })
        )}
      </div>

      {/* 音素磁贴 */}
      <div className={styles.tiles} role="group" aria-label="字母">
        {options.map((opt, idx) => (
          <button
            key={opt.id}
            type="button"
            className={`${styles.tile} ${playingIdx === idx ? styles.tileOn : ''}`}
            disabled={disabled}
            onClick={() => pickTile(opt, idx)}
            aria-label={`字母 ${opt.text}`}
          >
            {opt.text}
          </button>
        ))}
      </div>

      {/* 操作行 */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={undo}
          disabled={disabled || picked.length === 0}
        >
          退一步
        </button>
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={clear}
          disabled={disabled || picked.length === 0}
        >
          重来
        </button>
        <button
          type="button"
          className={styles.checkBtn}
          onClick={handleCheck}
          disabled={disabled || picked.length === 0}
        >
          拼好了
        </button>
      </div>

      <p className={styles.hint} aria-live="polite">
        {wrongHint ? '还不对，再听一遍，看看是哪一位不一样。' : '按顺序点字母，一个音一个音拼起来。'}
      </p>
    </div>
  );
}
