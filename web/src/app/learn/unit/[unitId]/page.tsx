'use client';

import { use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconSprite } from '@/components/icon-sprite';
import { PageError, PageLoading } from '@/components/page-states';
import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { UnitPlayer } from '@/features/learn/unit-player';
import styles from './unit.module.css';

type Params = Promise<{ unitId: string }>;

export default function UnitPage({ params }: { params: Params }) {
  const { unitId } = use(params);
  const { data, error, loading, reload } = useApi(() => api.getUnit(unitId), [unitId]);
  const unit = data?.unit ?? null;
  const router = useRouter();

  const goDone = useCallback(
    (stars: number) => {
      router.push(`/learn/unit/${unitId}/done?stars=${stars}`);
    },
    [router, unitId],
  );

  if (loading) {
    return (
      <div className={styles.missing}>
        <IconSprite />
        <PageLoading label="正在准备这一关…" />
      </div>
    );
  }

  // 404 不重试（内容不存在），网络错误可以重试
  if (error) {
    return (
      <div className={styles.missing}>
        <IconSprite />
        <PageError error={error} onRetry={reload} />
      </div>
    );
  }

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
