'use client';

import { useEffect, useRef } from 'react';
import type { TodayProgress } from '@/lib/types';
import { getDict, interpolate } from '@/i18n';
import styles from './pause-card.module.css';

type Props = {
  open: boolean;
  progress: TodayProgress;
  onClose: () => void;
};

const t = getDict('zh');

/**
 * 「先停一下」——纯手动暂停，不计时、不强制休息。
 * 产品不做使用时长限制，所以这里没有任何倒计时逻辑。
 */
export function PauseCard({ open, progress, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement;
    const id = window.setTimeout(() => resumeRef.current?.focus({ preventScroll: true }), 60);
    return () => {
      window.clearTimeout(id);
      if (lastFocus.current instanceof HTMLElement) {
        lastFocus.current.focus({ preventScroll: true });
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !cardRef.current) return;
      const focusables = cardRef.current.querySelectorAll<HTMLElement>('button:not([disabled])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.card} ref={cardRef} role="dialog" aria-modal="true" aria-labelledby="pause-title">
        <div className={styles.icon} aria-hidden="true">
          <svg>
            <use href="#i-pause" />
          </svg>
        </div>
        <h2 id="pause-title">{t.learn.pauseTitle}</h2>
        <p>{interpolate(t.learn.pauseDesc, { unit: progress.currentUnitIndex })}</p>
        <div className={styles.progress} aria-hidden="true">
          {Array.from({ length: progress.starsGoal }).map((_, i) => (
            <svg key={i} className={i < progress.starsToday ? styles.on : undefined}>
              <use href="#i-star" />
            </svg>
          ))}
        </div>
        <div className={styles.actions}>
          <button ref={resumeRef} type="button" className={styles.primary} onClick={onClose}>
            {t.learn.resume}
          </button>
          <button type="button" className={styles.ghost} onClick={onClose}>
            {t.learn.leave}
          </button>
        </div>
      </div>
    </div>
  );
}
