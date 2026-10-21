'use client';

import { use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconSprite } from '@/components/icon-sprite';
import { getUnit } from '@/lib/mock-data';
import { UnitPlayer } from '@/features/learn/unit-player';
import styles from './unit.module.css';

type Params = Promise<{ unitId: string }>;

export default function UnitPage({ params }: { params: Params }) {
  const { unitId } = use(params);
  const unit = getUnit(unitId);
  const router = useRouter();

  const goDone = useCallback(
    (stars: number) => {
      router.push(`/learn/unit/${unitId}/done?stars=${stars}`);
    },
    [router, unitId],
  );

  if (!unit) {
    return (
      <div className={styles.missing}>
        <IconSprite />
        <p>找不到这一关</p>
        <Link href="/learn">回到学习地图</Link>
      </div>
    );
  }

  return <UnitPlayer unit={unit} onFinish={goDone} onExit={() => router.push('/learn')} />;
}
