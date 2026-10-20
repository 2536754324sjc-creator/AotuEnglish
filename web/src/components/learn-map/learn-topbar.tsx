'use client';

import { useCallback, useState } from 'react';
import type { TodayProgress } from '@/lib/types';
import { getDict, interpolate } from '@/i18n';
import styles from './learn-topbar.module.css';

type Props = {
  progress: TodayProgress;
  onPause: () => void;
};

const t = getDict('zh');

export function LearnTopbar({ progress, onPause }: Props) {
  const [soundOn, setSoundOn] = useState(true);

  const toggleSound = useCallback(() => setSoundOn((v) => !v), []);

  return (
    <header className={styles.bar}>
      <button type="button" className={styles.child} aria-label={`${progress.learnerName} 的档案`}>
        <span className={styles.avatar} aria-hidden="true">
          <svg viewBox="0 0 54 54">
            <rect width="54" height="54" fill="#FFE0B6" />
            <circle cx="27" cy="31" r="13.5" fill="#F7C99B" />
            <path
              d="M12.5 27c1-10.5 7.6-16 14.5-16s13.5 5.5 14.5 16c-4.3-3.4-8.8-5-14.5-5s-10.2 1.6-14.5 5z"
              fill="#6B4A2F"
            />
            <circle cx="22" cy="31" r="1.9" fill="#12233F" />
            <circle cx="32" cy="31" r="1.9" fill="#12233F" />
            <path
              d="M23 37.2c2.6 2.4 5.4 2.4 8 0"
              stroke="#B4552D"
              strokeWidth="1.9"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="18.2" cy="35.5" r="2.4" fill="#F3A98D" opacity=".55" />
            <circle cx="35.8" cy="35.5" r="2.4" fill="#F3A98D" opacity=".55" />
          </svg>
        </span>
        <span className={styles.childCopy}>
          <span className={styles.childName}>{progress.learnerName}</span>
          <span className={styles.childLevel}>第 {progress.currentUnitIndex} 关</span>
        </span>
      </button>

      <div className={styles.today} aria-label={`今日已完成 ${progress.starsToday} 关，共 ${progress.starsGoal} 关`}>
        <span className={styles.todayLabel}>{t.learn.todayLabel}</span>
        <span className={styles.stars} aria-hidden="true">
          {Array.from({ length: progress.starsGoal }).map((_, i) => (
            <svg key={i} className={i < progress.starsToday ? styles.on : undefined}>
              <use href="#i-star" />
            </svg>
          ))}
        </span>
        <span className={styles.count}>
          {progress.starsToday}/{progress.starsGoal}
        </span>
      </div>

      <div className={styles.actions}>
        <div className={styles.starTotal} aria-label={interpolate(t.learn.starTotal, { count: progress.starTotal })}>
          <svg aria-hidden="true">
            <use href="#i-star" />
          </svg>
          <span>{progress.starTotal}</span>
        </div>
        <button
          type="button"
          className={styles.iconBtn}
          aria-pressed={soundOn}
          aria-label={soundOn ? '关闭声音' : '打开声音'}
          onClick={toggleSound}
        >
          <svg aria-hidden="true">
            <use href={soundOn ? '#i-sound' : '#i-mute'} />
          </svg>
        </button>
        <button type="button" className={styles.iconBtn} aria-label={t.learn.pause} onClick={onPause}>
          <svg aria-hidden="true">
            <use href="#i-pause" />
          </svg>
        </button>
      </div>
    </header>
  );
}
