'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LearnMap } from '@/components/learn-map/learn-map';
import { LearnTopbar } from '@/components/learn-map/learn-topbar';
import { IconSprite } from '@/components/icon-sprite';
import { PageError, PageLoading } from '@/components/page-states';
import { UnitSheet } from '@/components/unit-sheet';
import { PauseCard } from '@/components/pause-card';
import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { Unit } from '@/lib/types';
import styles from './learn.module.css';

export default function LearnPage() {
  const { data: progress, error, loading, reload } = useApi(() => api.getProgress(), []);
  const router = useRouter();
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const [paused, setPaused] = useState(false);

  const handleSelect = (unit: Unit) => {
    if (unit.status === 'locked') return;
    setActiveUnit(unit);
  };

  const handleStart = (unit: Unit) => {
    setActiveUnit(null);
    router.push(`/learn/unit/${unit.unitId}`);
  };

  if (loading) {
    return (
      <div className={styles.app}>
        <IconSprite />
        <PageLoading label="正在打开学习地图…" />
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className={styles.app}>
        <IconSprite />
        <PageError error={error ?? new Error('数据缺失')} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <IconSprite />
      <LearnTopbar progress={progress} onPause={() => setPaused(true)} />
      <main className={styles.stage}>
        <h1 className="sr-only">{progress.learnerName} 的学习地图</h1>
        <LearnMap progress={progress} onSelectUnit={handleSelect} />
      </main>

      <UnitSheet unit={activeUnit} onClose={() => setActiveUnit(null)} onStart={handleStart} />
      <PauseCard open={paused} progress={progress} onClose={() => setPaused(false)} />
    </div>
  );
}
