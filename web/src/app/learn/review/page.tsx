'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { IconSprite } from '@/components/icon-sprite';
import { PageError, PageLoading } from '@/components/page-states';
import { useAnswerMachine } from '@/features/learn/use-answer-machine';
import { PictureChoice } from '@/features/learn/picture-choice';
import { TapCard } from '@/features/learn/tap-card';
import { TextChoice } from '@/features/learn/text-choice';
import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { ReviewItem } from '@/lib/mock-review';
import type { Unit } from '@/lib/types';
import styles from './review.module.css';

/** 把到期的题目包成一个 Unit，好复用现成的答题状态机 */
function toReviewUnit(items: ReviewItem[]): Unit {
  return {
    unitId: 'review-session',
    index: 0,
    level: 'kids-a',
    topic: 'Review',
    titleZh: '今日复习',
    wordCount: items.length,
    estMinutes: Math.max(2, Math.ceil(items.length * 0.5)),
    status: 'current',
    questions: items.map((i) => i.question),
  };
}

export default function ReviewPage() {
  const { data, error, loading, reload } = useApi(() => api.getReview(), []);
  const items = useMemo(() => data?.items ?? [], [data]);
  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro');
  const [stars, setStars] = useState(1);

  const unit = useMemo(() => toReviewUnit(items), [items]);

  // 三个 early return 都在 hooks 之后，顺序稳定
  if (loading) {
    return (
      <div className={styles.page}>
        <IconSprite />
        <PageLoading label="正在查今天要复习的内容…" />
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

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <IconSprite />
        <div className={styles.empty}>
          <div className={styles.emptyArt} aria-hidden="true">
            <svg>
              <use href="#i-review" />
            </svg>
          </div>
          <h1>今天不用复习</h1>
          <p>学过的内容都还记得。去地图上闯新关吧。</p>
          <Link href="/learn" className={styles.primary}>
            去学习地图
          </Link>
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    return (
      <ReviewPlayer
        unit={unit}
        items={items}
        onFinish={(s) => {
          setStars(s);
          setPhase('done');
        }}
        onExit={() => setPhase('intro')}
      />
    );
  }

  if (phase === 'done') {
    return (
      <div className={styles.page}>
        <IconSprite />
        <div className={styles.doneCard}>
          <p className={styles.eyebrow}>复习完成</p>
          <h1 className={styles.doneTitle}>都过了一遍</h1>
          <div className={styles.stars} aria-label={`获得 ${stars} 颗星`}>
            {[0, 1, 2].map((i) => (
              <svg key={i} className={i < stars ? styles.starOn : styles.starOff} aria-hidden="true">
                <use href="#i-star" />
              </svg>
            ))}
          </div>
          <p className={styles.doneNote}>
            {stars === 3 ? '全都记得，很稳。' : '有几个还需要再看看，明天会再出现。'}
          </p>
          <div className={styles.doneActions}>
            <Link href="/learn" className={styles.primary}>
              回到地图
            </Link>
            <button type="button" className={styles.ghost} onClick={() => setPhase('playing')}>
              再复习一次
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 介绍：转盘式的到期概览
  const totalDue = items.length;
  const oldest = items.reduce((a, b) => (b.dueDays > a.dueDays ? b : a), items[0]);

  return (
    <div className={styles.page}>
      <IconSprite />
      <header className={styles.head}>
        <Link href="/learn" className={styles.back} aria-label="回到学习地图">
          <svg aria-hidden="true">
            <use href="#i-close" />
          </svg>
        </Link>
        <h1 className={styles.title}>复习</h1>
      </header>

      <div className={styles.intro}>
        <div className={styles.wheel} aria-hidden="true">
          <div className={styles.wheelInner}>
            <span className={styles.wheelNum}>{totalDue}</span>
            <span className={styles.wheelUnit}>个待复习</span>
          </div>
        </div>

        <p className={styles.introText}>
          有 {totalDue} 个词该复习了。「{oldest.fromUnitZh}」里的词最久没碰（
          {oldest.dueDays} 天前）。
        </p>

        <ul className={styles.dueList}>
          {items.map((item) => (
            <li key={item.id} className={styles.dueItem}>
              <span className={styles.dueUnit}>{item.fromUnitZh}</span>
              <span className={styles.dueWord}>{item.question.audioText}</span>
              <span className={styles.dueDays}>{item.dueDays} 天前</span>
            </li>
          ))}
        </ul>

        <button type="button" className={styles.primary} onClick={() => setPhase('playing')}>
          开始复习
        </button>
      </div>
    </div>
  );
}

function ReviewPlayer({
  unit,
  items,
  onFinish,
  onExit,
}: {
  unit: Unit;
  items: ReviewItem[];
  onFinish: (stars: number) => void;
  onExit: () => void;
}) {
  const machine = useAnswerMachine(unit);
  const q = machine.question;
  const item = items[machine.state.index];
  const pct = (machine.state.index / machine.total) * 100;

  const next = () => {
    if (machine.state.finished) {
      onFinish(machine.stars);
      return;
    }
    machine.next();
  };

  return (
    <div className={styles.player}>
      <IconSprite />
      <header className={styles.pbar}>
        <button type="button" className={styles.close} aria-label="退出复习" onClick={onExit}>
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
        >
          <span style={{ width: `${pct}%` }} />
        </div>
        <span className={styles.pcounter}>
          {machine.current}/{machine.total}
        </span>
      </header>

      <main className={styles.stage}>
        <p className={styles.fromTag}>来自「{item?.fromUnitZh}」</p>
        <p className={styles.prompt}>{q?.promptZh}</p>

        <div className={styles.choice}>
          {q?.type === 'listen_choose_image' && (
            <PictureChoice
              options={q.options}
              selected={machine.state.selected}
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
        </div>

        <div className={`${styles.feedback} ${machine.showRetryHint ? styles.retry : ''}`} role="status" aria-live="polite">
          {machine.state.phase === 'correct' && <span className={styles.good}>Great!</span>}
          {machine.showRetryHint && <span>再试一次</span>}
        </div>
      </main>

      <footer className={styles.footer}>
        {machine.state.phase === 'correct' ? (
          <button type="button" className={styles.primary} onClick={next}>
            {machine.state.finished ? '完成' : '下一个'}
          </button>
        ) : (
          <button
            type="button"
            className={styles.primary}
            disabled={!machine.canCheck}
            onClick={machine.check}
          >
            检查一下
          </button>
        )}
      </footer>
    </div>
  );
}
