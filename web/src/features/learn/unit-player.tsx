'use client';

import { useCallback, useEffect, useState } from 'react';
import { IconSprite } from '@/components/icon-sprite';
import type { Unit } from '@/lib/types';
import { useAnswerMachine } from '@/features/learn/use-answer-machine';
import { PictureChoice } from '@/features/learn/picture-choice';
import { TapCard } from '@/features/learn/tap-card';
import { TextChoice } from '@/features/learn/text-choice';
import { RepeatWord } from '@/features/learn/repeat-word';
import { BlendSounds } from '@/features/learn/blend-sounds';
import { BusinessScenario } from '@/features/learn/business-scenario';
import { getDict } from '@/i18n';
import styles from './unit-player.module.css';

const t = getDict('zh');

type Props = {
  unit: Unit;
  /** 答完全部题目后触发，由调用方决定去哪 */
  onFinish: (stars: number) => void;
  /** 点关闭按钮时触发，由调用方决定去哪 */
  onExit: () => void;
  /** 退出确认弹层的自定义文案（体验课里「进度不保留」的说法不同） */
  exitCopy?: { title: string; desc: string };
};

/**
 * 单元播放器：只负责「答题这件事」，不关心路由。
 * /learn/unit/[unitId] 与 /trial 共用它，区别在 onFinish / onExit。
 */
export function UnitPlayer({ unit, onFinish, onExit, exitCopy }: Props) {
  const [quitOpen, setQuitOpen] = useState(false);
  const machine = useAnswerMachine(unit);

  const handleFinish = useCallback(() => onFinish(machine.stars), [onFinish, machine.stars]);

  // 答完全部题后自动进下一步，给学习者明确的「完成」感
  useEffect(() => {
    if (!machine.state.finished) return;
    const id = window.setTimeout(handleFinish, 700);
    return () => window.clearTimeout(id);
  }, [machine.state.finished, handleFinish]);

  const q = machine.question;
  const progressPct = (machine.state.index / machine.total) * 100;
  const copy = exitCopy ?? { title: t.learn.quitTitle, desc: t.learn.quitDesc };

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
          {q?.type === 'repeat_word' && (
            <RepeatWord
              key={q.id}
              options={q.options}
              audioText={q.audioText}
              selected={machine.state.selected}
              disabled={machine.state.phase === 'correct'}
              onSelect={machine.select}
            />
          )}
          {q?.type === 'blend_sounds' && (
            <BlendSounds
              key={q.id}
              options={q.options}
              audioText={q.audioText}
              selected={machine.state.selected}
              disabled={machine.state.phase === 'correct'}
              onSelect={machine.select}
            />
          )}
          {q?.type === 'business_scenario' && (
            <BusinessScenario
              key={q.id}
              options={q.options}
              audioText={q.audioText}
              selected={machine.state.selected}
              disabled={machine.state.phase === 'correct'}
              revealed={machine.state.phase === 'correct'}
              onSelect={machine.select}
            />
          )}
          {q &&
            q.type !== 'listen_choose_image' &&
            q.type !== 'tap_to_read' &&
            q.type !== 'read_choose' &&
            q.type !== 'cloze' &&
            q.type !== 'repeat_word' &&
            q.type !== 'blend_sounds' &&
            q.type !== 'business_scenario' && (
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
            onClick={machine.state.finished ? handleFinish : machine.next}
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
            <h2 id="quit-title">{copy.title}</h2>
            <p>{copy.desc}</p>
            <div className={styles.quitActions}>
              <button type="button" className={styles.primary} onClick={() => setQuitOpen(false)}>
                {t.learn.quitStay}
              </button>
              <button type="button" className={styles.ghost} onClick={onExit}>
                {t.learn.quitConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
