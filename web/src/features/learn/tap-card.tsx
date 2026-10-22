'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Option } from '@/lib/types';
import { speak as speakText, stopSpeaking, type SpeakState } from '@/lib/speak';
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
 * 发音走统一模块（本地音频 -> 百度/有道代理 -> 浏览器合成）。
 */
export function TapCard({ options, audioText, selected, disabled, onSelect }: Props) {
  const [state, setState] = useState<SpeakState>('idle');
  const speaking = state === 'playing';

  const play = useCallback(() => {
    speakText({ text: audioText, onStateChange: setState });
  }, [audioText]);

  useEffect(() => {
    // 进题自动读一次，孩子不用先找按钮
    const t = window.setTimeout(play, 300);
    return () => {
      window.clearTimeout(t);
      stopSpeaking();
      setState('idle');
    };
  }, [play]);

  const handle = (id: string) => {
    if (disabled) return;
    play();
    onSelect(id);
  };

  const option = options[0];

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={`${styles.speaker} ${speaking ? styles.speaking : ''}`}
        aria-label="播放发音"
        onClick={play}
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
