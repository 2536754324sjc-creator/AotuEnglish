'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IconSprite } from '@/components/icon-sprite';
import { mockTodayProgress } from '@/lib/mock-data';
import { mockBadges, mockChest, mockShop } from '@/lib/mock-rewards';
import styles from './rewards.module.css';

export default function RewardsPage() {
  const progress = mockTodayProgress;
  const [chestOpen, setChestOpen] = useState(false);
  const [justOpened, setJustOpened] = useState(false);

  const { remaining, required, claimable, openedCount } = mockChest;
  const pct = ((required - remaining) / required) * 100;
  const earned = mockBadges.filter((b) => b.earnedAt);

  const handleOpen = () => {
    if (!claimable || chestOpen) return;
    setChestOpen(true);
    setJustOpened(true);
    window.setTimeout(() => setJustOpened(false), 1400);
  };

  return (
    <div className={styles.page}>
      <IconSprite />

      <header className={styles.head}>
        <Link href="/learn" className={styles.back} aria-label="回到学习地图">
          <svg aria-hidden="true">
            <use href="#i-close" />
          </svg>
        </Link>
        <h1 className={styles.title}>奖励</h1>
        <div className={styles.starTotal}>
          <svg aria-hidden="true">
            <use href="#i-star" />
          </svg>
          <span>{progress.starTotal}</span>
        </div>
      </header>

      <main className={styles.main}>
        {/* 宝箱 */}
        <section className={`${styles.chestCard} ${claimable ? styles.claimable : ''}`}>
          <button
            type="button"
            className={`${styles.chest} ${claimable ? styles.chestReady : ''} ${
              justOpened ? styles.chestPop : ''
            }`}
            onClick={handleOpen}
            disabled={!claimable}
            aria-label={claimable ? '打开宝箱' : `再完成 ${remaining} 关可以开宝箱`}
          >
            <svg aria-hidden="true">
              <use href="#i-chest" />
            </svg>
          </button>

          <div className={styles.chestText}>
            <h2>{claimable ? '宝箱可以开啦' : `再 ${remaining} 关开宝箱`}</h2>
            <p>已经开过 {openedCount} 次</p>
            <div
              className={styles.bar}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={required}
              aria-valuenow={required - remaining}
              aria-label="宝箱进度"
            >
              <span style={{ width: `${pct}%` }} />
            </div>
          </div>
        </section>

        {/* 徽章墙 */}
        <section>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>徽章</h2>
            <span className={styles.sectionCount}>
              {earned.length}/{mockBadges.length}
            </span>
          </div>

          <ul className={styles.badgeGrid}>
            {mockBadges.map((b) => {
              const got = Boolean(b.earnedAt);
              return (
                <li key={b.id} className={`${styles.badgeCard} ${got ? '' : styles.badgeLocked}`}>
                  <span className={styles.badgeIcon} aria-hidden="true">
                    <svg>
                      <use href={`#${b.icon}`} />
                    </svg>
                    {!got && (
                      <span className={styles.badgeLock}>
                        <svg>
                          <use href="#i-lock" />
                        </svg>
                      </span>
                    )}
                  </span>
                  <strong className={styles.badgeName}>{b.name}</strong>
                  <span className={styles.badgeDesc}>{b.desc}</span>

                  {got ? (
                    <span className={styles.badgeEarned}>{b.earnedAt} 获得</span>
                  ) : (
                    <>
                      <span className={styles.badgeTrack} aria-hidden="true">
                        <span style={{ width: `${b.progress * 100}%` }} />
                      </span>
                      <span className={styles.badgeProgress}>{b.progressText}</span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* 装扮 */}
        <section>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>装扮</h2>
            <span className={styles.sectionCount}>用星星兑换</span>
          </div>

          <ul className={styles.shopGrid}>
            {mockShop.map((item) => {
              const affordable = progress.starTotal >= item.price;
              const canBuy = !item.owned && affordable;
              return (
                <li key={item.id} className={styles.shopCard}>
                  <span className={styles.shopArt} aria-hidden="true">
                    <svg>
                      <use
                        href={item.id === 'hat' ? '#i-trophy' : item.id === 'cape' ? '#i-star' : '#i-paw'}
                      />
                    </svg>
                  </span>
                  <strong>{item.name}</strong>
                  {item.owned ? (
                    <span className={styles.ownedTag}>已拥有</span>
                  ) : (
                    <>
                      <span className={styles.price}>
                        <svg aria-hidden="true">
                          <use href="#i-star" />
                        </svg>
                        {item.price}
                      </span>
                      <button
                        type="button"
                        className={styles.buyBtn}
                        disabled={!canBuy}
                        title={canBuy ? undefined : '星星不够'}
                      >
                        {canBuy ? '兑换' : '星星不够'}
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <p className={styles.note}>装扮商店还在做，兑换暂未开放。</p>
      </main>
    </div>
  );
}
