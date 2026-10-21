'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { IconSprite } from '@/components/icon-sprite';
import { mockWords, emptyWords } from '@/lib/mock-words';
import type { WordCard } from '@/lib/mock-words';
import styles from './words.module.css';

/** 用浏览器语音合成读单词。接真实 TTS 时只替换这个函数。 */
function speak(text: string, onState?: (speaking: boolean) => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onState?.(false);
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 0.8;
    utter.onstart = () => onState?.(true);
    utter.onend = () => onState?.(false);
    utter.onerror = () => onState?.(false);
    window.speechSynthesis.speak(utter);
  } catch {
    onState?.(false);
  }
}

export default function WordsPage() {
  // 用空词包可以看空状态：把 mockWords 换成 emptyWords 即可
  const all = mockWords;
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'collected' | 'locked'>('all');
  const timer = useRef<number | null>(null);

  const handleSpeak = useCallback((card: WordCard) => {
    if (!card.collected) return;
    setSpeakingWord(card.word);
    speak(card.word, (on) => {
      if (!on) {
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setSpeakingWord(null), 300);
      }
    });
  }, []);

  const collected = useMemo(() => all.filter((w) => w.collected), [all]);
  const shown = useMemo(() => {
    if (filter === 'collected') return all.filter((w) => w.collected);
    if (filter === 'locked') return all.filter((w) => !w.collected);
    return all;
  }, [all, filter]);

  const isEmpty = all.length === 0 || all === emptyWords;

  return (
    <div className={styles.page}>
      <IconSprite />

      <header className={styles.head}>
        <Link href="/learn" className={styles.back} aria-label="回到学习地图">
          <svg aria-hidden="true">
            <use href="#i-close" />
          </svg>
        </Link>
        <h1 className={styles.title}>词汇图卡</h1>
        <span className={styles.counter}>
          {collected.length}/{all.length}
        </span>
      </header>

      {isEmpty ? (
        <div className={styles.empty}>
          <div className={styles.emptyArt} aria-hidden="true">
            <svg>
              <use href="#i-card" />
            </svg>
          </div>
          <h2>词包还是空的</h2>
          <p>先过一关，这一关的词就会收进来。</p>
          <Link href="/learn" className={styles.primary}>
            去学习地图
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.filters} role="group" aria-label="筛选">
            {(
              [
                ['all', '全部', all.length],
                ['collected', '已收集', collected.length],
                ['locked', '未收集', all.length - collected.length],
              ] as const
            ).map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                className={`${styles.filterBtn} ${filter === key ? styles.filterOn : ''}`}
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
              >
                {label}
                <span className={styles.filterCount}>{count}</span>
              </button>
            ))}
          </div>

          <ul className={styles.grid}>
            {shown.map((card) => (
              <li key={`${card.unitZh}-${card.word}`}>
                <button
                  type="button"
                  className={[
                    styles.card,
                    card.collected ? '' : styles.locked,
                    speakingWord === card.word ? styles.speaking : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleSpeak(card)}
                  disabled={!card.collected}
                  aria-label={
                    card.collected
                      ? `${card.word}，${card.meaningZh}，点击播放发音`
                      : `${card.word}，尚未收集`
                  }
                >
                  <span className={styles.unitTag}>{card.unitZh}</span>
                  <span className={styles.word}>{card.word}</span>
                  <span className={styles.phonetic}>{card.phonetic}</span>
                  <span className={styles.meaning}>{card.meaningZh}</span>

                  {!card.collected ? (
                    <span className={styles.lockBadge} aria-hidden="true">
                      <svg>
                        <use href="#i-lock" />
                      </svg>
                    </span>
                  ) : (
                    <span className={styles.playBadge} aria-hidden="true">
                      <svg>
                        <use href="#i-sound" />
                      </svg>
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <p className={styles.hint}>点卡片听发音</p>
        </>
      )}
    </div>
  );
}
