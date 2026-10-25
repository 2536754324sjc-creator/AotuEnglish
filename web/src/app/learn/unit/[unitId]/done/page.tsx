'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconSprite } from '@/components/icon-sprite';
import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { readHandoff, clearHandoff } from '@/lib/done-handoff';
import type { DoneHandoff } from '@/lib/types';
import styles from './done.module.css';

type Params = Promise<{ unitId: string }>;

export default function DonePage({ params }: { params: Params }) {
  const { unitId } = use(params);
  const router = useRouter();

  // SSR 与首帧都为 null，挂载后再读，避免 hydration 不一致。
  // 只读不删：刷新结算页仍能看到本次成绩（否则用户会以为没存上）。
  // 清除只发生在点「再玩一次」时 —— 见下方 handler。
  const [handoff, setHandoff] = useState<DoneHandoff | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHandoff(readHandoff());
    setMounted(true);
  }, []);

  // 结算页只需要单元标题，加载中回退成「本关」，不显示 loading 页
  const { data } = useApi(() => api.getUnit(unitId), [unitId]);
  const unit = data?.unit ?? null;

  const stars = handoff?.stars ?? 0;

  // 星星逐颗落下：每颗延迟 220ms
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (stars <= 0) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= stars) window.clearInterval(id);
    }, 220);
    return () => window.clearInterval(id);
  }, [stars]);

  return (
    <div className={styles.app}>
      <IconSprite />

      <main className={styles.card}>
        {mounted && !handoff ? (
          <>
            <p className={styles.eyebrow}>结算记录已过期</p>
            <h1 className={styles.title}>{unit ? unit.titleZh : '本关'}</h1>
            <p className={styles.note}>
              这次成绩只在刚答完时显示。进度以学习地图为准，回去看看就知道有没有记上。
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.primary} onClick={() => router.push('/learn')}>
                回到地图
              </button>
              <Link
                href={`/learn/unit/${unitId}`}
                className={styles.ghost}
                onClick={() => clearHandoff()}
              >
                再玩一次
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className={styles.eyebrow}>这一关完成了</p>
            <h1 className={styles.title}>{unit ? unit.titleZh : '本关'}</h1>

            <div className={styles.stars} aria-label={`获得 ${stars} 颗星`}>
              {[0, 1, 2].map((i) => (
                <svg
                  key={i}
                  className={`${styles.star} ${i < shown ? styles.on : ''}`}
                  style={{ animationDelay: `${i * 220}ms` }}
                  aria-hidden="true"
                >
                  <use href="#i-star" />
                </svg>
              ))}
            </div>

            <p className={styles.note}>
              {handoff?.submitError
                ? '刚才网络不太顺，这次的成绩可能没存上。'
                : stars === 3
                  ? '全部一次答对，太棒了！'
                  : stars === 2
                    ? '很不错，再稳一点就满星。'
                    : '完成就是进步，明天再来。'}
            </p>

            {/* 星总数来自服务端；本地折算/上报失败时没有这个值，就不显示，避免编数字 */}
            {typeof handoff?.starTotal === 'number' && (
              <p className={styles.total}>现在一共 {handoff.starTotal} 颗星</p>
            )}

            <div className={styles.actions}>
              <button type="button" className={styles.primary} onClick={() => router.push('/learn')}>
                回到地图
              </button>
              <button
                type="button"
                className={styles.ghost}
                onClick={() => {
                  // 清掉本次成绩再重玩：避免重答失败时沿用旧星星
                  clearHandoff();
                  router.replace(`/learn/unit/${unitId}`);
                }}
              >
                再玩一次
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
