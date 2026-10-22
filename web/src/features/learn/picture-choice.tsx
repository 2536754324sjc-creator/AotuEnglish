'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Option } from '@/lib/types';
import { resolveCardImage } from '@/lib/card-images';
import { speak as speakText, stopSpeaking, type SpeakState } from '@/lib/speak';
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
  /** 正确答案的单词，用于无障碍朗读（图片 alt） */
  answerText?: string;
};

/** 图卡的兜底图：图片加载失败时用几何图形，不留白也不显示裂图 */
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
        <path d="M60 26l30 52H30z" fill={`hsl(${hue} 65% 62%)`} strokeLinejoin="round" />
      )}
      <rect x="34" y="86" width="52" height="12" rx="6" fill={`hsl(${hue} 55% 72%)`} />
    </svg>
  );
}

/**
 * 单张卡片的图像：先试真实图片，失败自动回落到占位图。
 * 这样图片没生成全时，页面依然完整可用，不会出现裂图或空白块。
 */
function CardArt({ option, label }: { option: Option; label: string }) {
  const src = resolveCardImage(option);
  const [failed, setFailed] = useState(false);

  // 选项换了就重置：用 src 作为 key 上的比较基准
  const srcKey = src ?? '';
  const [lastSrc, setLastSrc] = useState(srcKey);
  if (lastSrc !== srcKey) {
    setLastSrc(srcKey);
    setFailed(false);
  }

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={src}
        ref={(el) => {
          // 兜底：图片可能在 React 挂上 onError 之前就失败了（缓存里的 404），
          // 那样不会触发回调，这里在挂载后主动查一次。
          if (el && el.complete && el.naturalWidth === 0) setFailed(true);
        }}
        src={src}
        alt={label}
        className={styles.art}
        loading="eager"
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
      />
    );
  }

  return <PlaceholderArt seed={option.imagePrompt ?? option.id} />;
}

export function PictureChoice({
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
    speakText({ text: audioText, rate: 0.8, onStateChange: setState });
  }, [audioText]);

  useEffect(() => {
    // 进入题目自动读一次，孩子不用先找按钮
    const t = window.setTimeout(play, 300);
    return () => {
      window.clearTimeout(t);
      stopSpeaking();
      setState('idle');
    };
  }, [play]);

  return (
    <div className={styles.wrap}>
      {audioText && (
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
      )}

      <div className={styles.grid} role="group" aria-label="选项">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrect = revealed && opt.correct;
          // 图片的 alt 用单词本身，读屏用户能听到
          const label = opt.text ?? opt.imagePrompt?.split(',')[0] ?? '';
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
              <CardArt option={opt} label={label} />
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
