'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Option } from '@/lib/types';
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
  const [speaking, setSpeaking] = useState(false);
  const timer = useRef<number | null>(null);

  const speak = useCallback(() => {
    if (!audioText || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(audioText);
      utter.lang = 'en-US';
      utter.rate = 0.85;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utter);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setSpeaking(false), 2500);
    } catch {
      setSpeaking(false);
    }
  }, [audioText]);

  useEffect(() => {
    if (audioText) speak();
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [speak, audioText]);

  return (
    <div className={styles.wrap}>
      {audioText && (
        <div className={styles.promptRow}>
          <button
            type="button"
            className={`${styles.speaker} ${speaking ? styles.speaking : ''}`}
            aria-label="再听一次"
            onClick={speak}
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
