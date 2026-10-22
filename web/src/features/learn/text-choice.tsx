'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Option } from '@/lib/types';
import { speak as speakText, stopSpeaking, type SpeakState } from '@/lib/speak';
import styles from './text-choice.module.css';

type Props = {
  options: Option[];
  selected: string | null;
  disabled: boolean;
  revealed: boolean;
  onSelect: (id: string) => void;
  /** 题面里要显示的英文词或句子 */
  audioText?: string;
};

/**
 * 文字选择：用于 read_choose（选中文释义）与 cloze（选词填空）。
 * 题干在上，选项是横排文字按钮，适合已经开始识字的 7 岁以上。
 */
export function TextChoice({
  options,
  selected,
  disabled,
  revealed,
  onSelect,
  audioText,
}: Props) {
  const [state, setState] = useState<SpeakState>('idle');
  const speaking = state === 'playing';

  const play = useCallback(() => {
    if (!audioText) return;
    speakText({ text: audioText, onStateChange: setState });
  }, [audioText]);

  useEffect(() => {
    if (!audioText) return;
    const t = window.setTimeout(play, 300);
    return () => {
      window.clearTimeout(t);
      stopSpeaking();
      setState('idle');
    };
  }, [play, audioText]);

  return (
    <div className={styles.wrap}>
      {audioText && (
        <div className={styles.promptRow}>
          <button
            type="button"
            className={`${styles.speaker} ${speaking ? styles.speaking : ''}`}
            aria-label="再听一次"
            onClick={play}
          >
            <svg aria-hidden="true">
              <use href="#i-sound" />
            </svg>
          </button>
          <span className={styles.word}>{audioText}</span>
        </div>
      )}

      <div className={styles.grid} role="group" aria-label="选项">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrect = revealed && opt.correct;
          return (
            <button
              key={opt.id}
              type="button"
              className={[
                styles.card,
                isSelected ? styles.selected : '',
                isCorrect ? styles.correct : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => onSelect(opt.id)}
            >
              <span className={styles.text}>{opt.text ?? opt.imagePrompt ?? opt.id}</span>
              {isCorrect && (
                <span className={styles.badge} aria-hidden="true">
                  <svg>
                    <use href="#i-check" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
