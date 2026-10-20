'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Option } from '@/lib/types';
import styles from './picture-choice.module.css';

type Props = {
  options: Option[];
  selected: string | null;
  disabled: boolean;
  /** 答对时给正确项打勾 */
  revealed: boolean;
  onSelect: (id: string) => void;
  /** 题目的发音文本；有值就显示喇叭按钮 */
  audioText?: string;
};

/** 图卡的兜底图：还没有真实图片时用几何图形占位，不用灰色方块 */
function PlaceholderArt({ seed }: { seed: string }) {
  // 不能用首字符算色相：Dify 的 imagePrompt 都以 "a cartoon" 开头，
  // 首字母全是 a，会导致所有占位图同色。这里取整串的哈希。
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) % 360;
  }
  const hue = Math.abs(h);
  // 用不同形状区分，不单靠颜色（色弱也能分辨）
  const shape = Math.abs(h >> 2) % 3;
  return (
    <svg viewBox="0 0 120 120" className={styles.art} aria-hidden="true">
      <rect width="120" height="120" rx="18" fill={`hsl(${hue} 70% 88%)`} />
      {shape === 0 && <circle cx="60" cy="54" r="26" fill={`hsl(${hue} 65% 62%)`} />}
      {shape === 1 && (
        <rect x="34" y="28" width="52" height="52" rx="12" fill={`hsl(${hue} 65% 62%)`} />
      )}
      {shape === 2 && (
        <path
          d="M60 26l30 52H30z"
          fill={`hsl(${hue} 65% 62%)`}
          strokeLinejoin="round"
        />
      )}
      <rect x="34" y="86" width="52" height="12" rx="6" fill={`hsl(${hue} 55% 72%)`} />
    </svg>
  );
}

export function PictureChoice({
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
      utter.rate = 0.8;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utter);
      // 兜底：某些浏览器不触发 onstart
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setSpeaking(false), 2500);
    } catch {
      setSpeaking(false);
    }
  }, [audioText]);

  useEffect(() => {
    // 进入题目自动读一次，孩子不用先找按钮
    speak();
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [speak]);

  return (
    <div className={styles.wrap}>
      {audioText && (
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
              {opt.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={opt.imageUrl} alt="" className={styles.art} />
              ) : (
                <PlaceholderArt seed={opt.imagePrompt ?? opt.id} />
              )}
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
