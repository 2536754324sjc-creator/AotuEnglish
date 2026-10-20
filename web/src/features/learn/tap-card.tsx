'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Option } from '@/lib/types';
import styles from './tap-card.module.css';

type Props = {
  options: Option[];
  audioText: string;
  selected: string | null;
  disabled: boolean;
  onSelect: (id: string) => void;
};

/**
 * 点读卡：点一下播发音，同时视为「已作答」。
 * 没有真实音频文件前用 SpeechSynthesis 兜底；不支持时静默降级，不影响流程。
 */
export function TapCard({ options, audioText, selected, disabled, onSelect }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const timer = useRef<number | null>(null);

  const speak = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(audioText);
      utter.lang = 'en-US';
      utter.rate = 0.85;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utter);
    } catch {
      setSpeaking(false);
    }
  }, [audioText]);

  useEffect(() => {
    // 进题自动读一次，孩子不用先找按钮
    speak();
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [speak]);

  const handle = (id: string) => {
    if (disabled) return;
    speak();
    onSelect(id);
  };

  const option = options[0];

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={`${styles.speaker} ${speaking ? styles.speaking : ''}`}
        aria-label="播放发音"
        onClick={speak}
      >
        <svg aria-hidden="true">
          <use href="#i-sound" />
        </svg>
      </button>

      <button
        type="button"
        className={`${styles.word} ${selected ? styles.picked : ''}`}
        aria-pressed={Boolean(selected)}
        disabled={disabled}
        onClick={() => option && handle(option.id)}
      >
        {option?.text ?? audioText}
      </button>

      <p className={styles.hint}>点一下卡片听发音</p>
    </div>
  );
}
