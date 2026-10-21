'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconSprite } from '@/components/icon-sprite';
import { UnitPlayer } from '@/features/learn/unit-player';
import { getUnit } from '@/lib/mock-data';
import type { Unit } from '@/lib/types';
import styles from './trial.module.css';

/**
 * 体验课：不注册、不留信息，直接进第 1 题。
 * 玩完才给「保存这份记录」，这是留资的唯一时机。
 *
 * 用的是 - 第 4 关（当前进行中的关），因为它是最能代表产品的一关。
 */
const TRIAL_UNIT_ID = 'kids-a-numbers';

export default function TrialPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro');
  const [stars, setStars] = useState(1);

  const unit = getUnit(TRIAL_UNIT_ID);

  const handleFinish = useCallback((s: number) => {
    setStars(s);
    setPhase('done');
  }, []);

  if (!unit) {
    return (
      <div className={styles.fallback}>
        <IconSprite />
        <p>体验课暂时不可用</p>
        <button type="button" className={styles.ghostBtn} onClick={() => router.push('/')}>
          回首页
        </button>
      </div>
    );
  }

  if (phase === 'playing') {
    return (
      <UnitPlayer
        unit={unit}
        onFinish={handleFinish}
        onExit={() => setPhase('intro')}
        exitCopy={{
          title: '现在走，这次体验就结束了吗？',
          desc: '不用注册，随时可以回来重新体验。',
        }}
      />
    );
  }

  if (phase === 'done') {
    return <TrialResult unit={unit} stars={stars} onRetry={() => setPhase('playing')} />;
  }

  return (
    <div className={styles.intro}>
      <IconSprite />
      <div className={styles.introCard}>
        <span className={styles.eyebrow}>免费体验 · 不用注册</span>
        <h1 className={styles.introTitle}>
          试一关
          <span className={styles.introUnit}>{unit.titleZh}</span>
        </h1>
        <p className={styles.introDesc}>
          {unit.questions.length} 道题，大约 {unit.estMinutes} 分钟。
          听音选图、点读单词，玩完看看孩子喜不喜欢。
        </p>

        <button type="button" className={styles.primary} onClick={() => setPhase('playing')}>
          开始体验
        </button>

        <p className={styles.introNote}>不需要填写任何信息</p>
      </div>
    </div>
  );
}

function TrialResult({
  unit,
  stars,
  onRetry,
}: {
  unit: Unit;
  stars: number;
  onRetry: () => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    // 只做最基本的格式判断，体验课不该为难人
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('邮箱格式看起来不对，再检查一下');
      return;
    }
    setError('');
    setSaved(true);
  };

  return (
    <div className={styles.result}>
      <IconSprite />
      <div className={styles.resultCard}>
        <p className={styles.eyebrow}>这一关完成了</p>
        <h1 className={styles.resultTitle}>{unit.titleZh}</h1>

        <div className={styles.stars} aria-label={`获得 ${stars} 颗星`}>
          {[0, 1, 2].map((i) => (
            <svg key={i} className={i < stars ? styles.starOn : styles.starOff} aria-hidden="true">
              <use href="#i-star" />
            </svg>
          ))}
        </div>

        {saved ? (
          <div className={styles.savedBox} role="status">
            <h2>记下了</h2>
            <p>我们会把这份记录发到 {email}，你可以用它继续孩子的学习地图。</p>
            <button type="button" className={styles.primary} onClick={() => router.push('/')}>
              回首页看看
            </button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={submit} noValidate>
            <h2 className={styles.formTitle}>保存这份记录</h2>
            <p className={styles.formDesc}>
              填个邮箱，这次体验的成绩会存进孩子的学习地图。不想要也可以直接走。
            </p>
            <label className={styles.label} htmlFor="trial-email">
              邮箱
            </label>
            <input
              id="trial-email"
              className={styles.input}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'trial-email-error' : undefined}
            />
            {error && (
              <p className={styles.error} id="trial-email-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className={styles.primary}>
              保存记录
            </button>

            <div className={styles.actions}>
              <button type="button" className={styles.ghost} onClick={onRetry}>
                再玩一次
              </button>
              <button type="button" className={styles.ghost} onClick={() => router.push('/')}>
                先不保存
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
