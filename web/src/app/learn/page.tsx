'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LearnMap } from '@/components/learn-map/learn-map';
import { LearnTopbar } from '@/components/learn-map/learn-topbar';
import { IconSprite } from '@/components/icon-sprite';
import { UnitSheet } from '@/components/unit-sheet';
import { PauseCard } from '@/components/pause-card';
import { mockTodayProgress } from '@/lib/mock-data';
import type { Unit } from '@/lib/types';
import styles from './learn.module.css';

export default function LearnPage() {
  const progress = mockTodayProgress;
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
