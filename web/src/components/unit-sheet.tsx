'use client';

import { useEffect, useRef } from 'react';
import type { Unit } from '@/lib/types';
import { getDict, interpolate } from '@/i18n';
import styles from './unit-sheet.module.css';

type Props = {
  unit: Unit | null;
  onClose: () => void;
  onStart: (unit: Unit) => void;
};

const t = getDict('zh');

export function UnitSheet({ unit, onClose, onStart }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<Element | null>(null);
  const open = unit !== null;

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement;
    const id = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 60);
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
      if (e.key !== 'Tab' || !sheetRef.current) return;
      const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
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

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open || !unit) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        ref={sheetRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          aria-label={t.common.close}
          onClick={onClose}
        >
          <svg>
            <use href="#i-close" />
          </svg>
        </button>

        <h2 className={styles.title} id="sheet-title">
          {unit.titleZh}
          <span className={styles.en}>{unit.topic}</span>
        </h2>
        <p className={styles.meta}>
          {interpolate(t.learn.unitMeta, {
            words: unit.wordCount,
            minutes: unit.estMinutes,
          })}
        </p>

        <div className={styles.tasks} aria-label="这一关的内容">
          <div className={styles.task}>
            <svg>
              <use href="#i-ear" />
            </svg>
            <span>听音选图</span>
          </div>
          <div className={styles.task}>
            <svg>
              <use href="#i-mic" />
            </svg>
            <span>跟读单词</span>
          </div>
          <div className={styles.task}>
            <svg>
              <use href="#i-puzzle" />
            </svg>
            <span>小游戏</span>
          </div>
        </div>

        <button type="button" className={styles.primary} onClick={() => onStart(unit)}>
          <svg aria-hidden="true">
            <use href="#i-play" />
          </svg>
          <span>
            {unit.status === 'done'
              ? t.learn.reviewUnit
              : interpolate(t.learn.startUnit, { unit: unit.index })}
          </span>
        </button>
      </div>
    </div>
  );
}
