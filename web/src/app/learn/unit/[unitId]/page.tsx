'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconSprite } from '@/components/icon-sprite';
import { getUnit } from '@/lib/mock-data';
import type { Unit } from '@/lib/types';
import { useAnswerMachine } from '@/features/learn/use-answer-machine';
import { PictureChoice } from '@/features/learn/picture-choice';
import { TapCard } from '@/features/learn/tap-card';
import { TextChoice } from '@/features/learn/text-choice';
import { getDict } from '@/i18n';
import styles from './unit.module.css';

const t = getDict('zh');

type Params = Promise<{ unitId: string }>;

export default function UnitPage({ params }: { params: Params }) {
  const { unitId } = use(params);
  const unit = getUnit(unitId);

  if (!unit) {
    return (
      <div className={styles.missing}>
        <IconSprite />
        <p>找不到这一关</p>
        <Link href="/learn">回到学习地图</Link>
      </div>
    );
  }

  return <UnitRunner unit={unit} />;
}

function UnitRunner({ unit }: { unit: Unit }) {
  const router = useRouter();
  const [quitOpen, setQuitOpen] = useState(false);
  const machine = useAnswerMachine(unit);

  const goDone = useCallback(() => {
    router.push(`/learn/unit/${unit.unitId}/done?stars=${machine.stars}`);
  }, [machine.stars, router, unit.unitId]);

  // 答完全部题后自动进结算，给孩子明确的「完成」感
  useEffect(() => {
    if (!machine.state.finished) return;
    const id = window.setTimeout(goDone, 700);
    return () => window.clearTimeout(id);
  }, [machine.state.finished, goDone]);

  const q = machine.question;
  const progressPct = (machine.state.index / machine.total) * 100;

  return (
    <div className={styles.app}>
      <IconSprite />

      <header className={styles.bar}>
        <button
          type="button"
          className={styles.close}
          aria-label={t.common.close}
          onClick={() => setQuitOpen(true)}
        >
          <svg aria-hidden="true">
            <use href="#i-close" />
          </svg>
        </button>

        <div
          className={styles.progress}
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={machine.total}
          aria-valuenow={machine.current}
          aria-label={`第 ${machine.current} 题，共 ${machine.total} 题`}
        >
          <span style={{ width: `${progressPct}%` }} />
        </div>

        <span className={styles.counter}>
          {machine.current}/{machine.total}
        </span>
      </header>

      <main className={styles.stage}>
        <p className={styles.prompt}>{q?.promptZh ?? '这一关已经完成'}</p>

        <div className={styles.choice}>
          {q?.type === 'listen_choose_image' && (
            <PictureChoice
              options={q.options}
              selected={machine.state.selected}
              // 只有答对才锁卡片；答错必须能重新选
              disabled={machine.state.phase === 'correct'}
              revealed={machine.state.phase === 'correct'}
              onSelect={machine.select}
              audioText={q.audioText}
            />
          )}
          {q?.type === 'tap_to_read' && (
            <TapCard
              key={q.id}
              options={q.options}
              audioText={q.audioText}
              selected={machine.state.selected}
              disabled={machine.state.phase === 'correct'}
              onSelect={machine.select}
            />
          )}
          {(q?.type === 'read_choose' || q?.type === 'cloze') && (
            <TextChoice
              key={q.id}
              options={q.options}
              selected={machine.state.selected}
              disabled={machine.state.phase === 'correct'}
              revealed={machine.state.phase === 'correct'}
              onSelect={machine.select}
              audioText={q.audioText}
            />
          )}
          {q &&
            q.type !== 'listen_choose_image' &&
            q.type !== 'tap_to_read' &&
            q.type !== 'read_choose' &&
            q.type !== 'cloze' && (
              <p className={styles.unsupported}>这一题型还在做（{q.type}）</p>
            )}
        </div>

        <div
          className={`${styles.feedback} ${machine.showRetryHint ? styles.retry : ''}`}
          role="status"
          aria-live="polite"
        >
          {machine.state.phase === 'correct' && <span className={styles.good}>{t.learn.correct}</span>}
          {machine.showRetryHint && <span>{t.learn.wrongHint}</span>}
        </div>
      </main>

      <footer className={styles.footer}>
        {machine.state.phase === 'correct' ? (
          <button
            type="button"
            className={styles.primary}
            onClick={machine.state.finished ? goDone : machine.next}
          >
            {machine.state.finished ? '完成' : t.common.next}
          </button>
        ) : (
          <button
            type="button"
            className={styles.primary}
            disabled={!machine.canCheck}
            onClick={machine.check}
          >
            {t.common.check}
          </button>
        )}
      </footer>

      {quitOpen && (
        <div className={styles.quitWrap}>
          <div
            className={styles.quitCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quit-title"
          >
            <h2 id="quit-title">{t.learn.quitTitle}</h2>
            <p>{t.learn.quitDesc}</p>
            <div className={styles.quitActions}>
              <button type="button" className={styles.primary} onClick={() => setQuitOpen(false)}>
                {t.learn.quitStay}
              </button>
              <button type="button" className={styles.ghost} onClick={() => router.push('/learn')}>
                {t.learn.quitConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
