'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { IconSprite } from '@/components/icon-sprite';
import { PageError, PageLoading } from '@/components/page-states';
import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { WordCard } from '@/lib/mock-words';
import { speak as speakText, stopSpeaking } from '@/lib/speak';
import styles from './words.module.css';

export default function WordsPage() {
  const { data, error, loading, reload } = useApi(() => api.getWords(), []);
  const all = useMemo(() => data?.items ?? [], [data]);

  const [speakingWord, setSpeakingWord] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'collected' | 'locked'>('all');

  const handleSpeak = useCallback((card: WordCard) => {
    if (!card.collected) return;
    setSpeakingWord(card.word);
    speakText({
      text: card.word,
      rate: 0.8,
      onStateChange: (state) => {
        if (state === 'idle') setSpeakingWord(null);
      },
    });
  }, []);

  // 离开页面时停掉正在播的声音
  useEffect(() => () => stopSpeaking(), []);

  const collected = useMemo(() => all.filter((w) => w.collected), [all]);
  const shown = useMemo(() => {
    if (filter === 'collected') return all.filter((w) => w.collected);
    if (filter === 'locked') return all.filter((w) => !w.collected);
    return all;
  }, [all, filter]);

  const isEmpty = !loading && !error && all.length === 0;

  if (loading) {
    return (
      <div className={styles.page}>
        <IconSprite />
        <PageLoading label="正在整理词卡…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <IconSprite />
        <PageError error={error} onRetry={reload} />
      </div>
    );
  }

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
