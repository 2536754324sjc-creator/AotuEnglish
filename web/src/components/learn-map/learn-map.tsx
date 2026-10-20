'use client';

import type { Level } from '@/design/tokens';
import { levels } from '@/design/tokens';
import type { TodayProgress, Unit } from '@/lib/types';
import { getDict, interpolate } from '@/i18n';
import styles from './learn-map.module.css';

const t = getDict('zh');

type Props = {
  progress: TodayProgress;
  /** 首页切片用 compact，学习端用 full */
  variant?: 'full' | 'compact';
  onSelectUnit?: (unit: Unit) => void;
};

/** 桌面端 5 个节点的横向路径（取自原型 design/kid/map.html，末段收在最后节点处） */
const desktopPath =
  'M180 520C240 520 330 400 418 348C520 300 580 420 648 472C722 522 810 382 876 306C948 234 1032 392 1096 440C1120 460 1140 500 1110 520';

/** 轨迹 */
const mobilePath =
  'M195 70C140 110 90 180 105 230C120 285 240 330 281 390C318 445 185 505 125 560C75 610 225 645 271 690C305 735 235 795 195 840';

/** 每个节点在路径上的位置（百分比），顺序与单元一致 */
const desktopSpots = [
  { x: 14, y: 68 },
  { x: 29, y: 46 },
  { x: 45, y: 62 },
  { x: 61, y: 40 },
  { x: 77, y: 58 },
];

const mobileSpots = [
  { x: 50, y: 12 },
  { x: 26, y: 32 },
  { x: 71, y: 52 },
  { x: 32, y: 72 },
  { x: 69, y: 90 },
];

const nodeIcon: Record<string, string> = {
  greetings: 'i-chat',
  colors: 'i-drop',
  animals: 'i-paw',
  numbers: 'i-dice',
};

function iconFor(unit: Unit) {
  return nodeIcon[unit.topic.toLowerCase()] ?? 'i-house';
}

export function LearnMap({ progress, variant = 'full', onSelectUnit }: Props) {
  const cfg = levels[progress.level as Level] ?? levels['kids-a'];
  const [doneSize, currentSize, lockedSize] = cfg.nodeSize;

  const sizeFor = (u: Unit) =>
    u.status === 'done' ? doneSize : u.status === 'current' ? currentSize : lockedSize;

  // 手机与桌面是两套坐标：节点同时带两组自定义属性，由媒体查询选用
  const currentIdx = Math.max(
    0,
    progress.units.findIndex((u) => u.status === 'current'),
  );
  const coachSpot = desktopSpots[currentIdx % desktopSpots.length];

  return (
    <div
      className={`${styles.map} ${variant === 'compact' ? styles.compact : ''}`}
      style={
        {
          '--coach-x': `${coachSpot.x}%`,
          '--coach-y': `${coachSpot.y}%`,
        } as React.CSSProperties
      }
    >
      {/* 天空与丘陵背景 */}
      <div className={styles.skyGlow} aria-hidden="true" />
      <svg className={styles.hills} viewBox="0 0 1440 520" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 250C200 180 360 300 560 250S920 140 1120 230s200 70 320 -10v300H0z" fill="#D8EFD3" />
        <path d="M0 340c220-60 400 40 620-10s360-80 580 0 200 50 240 -10v200H0z" fill="#C4E7C2" />
        <path d="M0 430c240-70 460 30 720-20s400-60 720 20v90H0z" fill="#AFDDAE" />
      </svg>

      {/* 轨迹：桌面走横S形，手机走竖排折线，由 CSS 切换 */}
      <svg
        className={`${styles.trail} ${styles.trailDesktop}`}
        viewBox="0 0 1440 760"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className={styles.trailBase} d={desktopPath} />
        <path className={styles.trailFill} d={desktopPath} />
        <path className={styles.trailDash} d={desktopPath} />
      </svg>
      <svg
        className={`${styles.trail} ${styles.trailMobile}`}
        viewBox="0 0 390 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className={styles.trailBase} d={mobilePath} />
        <path className={styles.trailFill} d={mobilePath} />
        <path className={styles.trailDash} d={mobilePath} />
      </svg>

      {/* 节点 */}
      <div className={styles.nodes}>
        {progress.units.map((unit, i) => (
          <button
            key={unit.unitId}
            type="button"
            className={`${styles.node} ${styles[unit.status]}`}
            style={
              {
                '--x': `${desktopSpots[i % desktopSpots.length].x}%`,
                '--y': `${desktopSpots[i % desktopSpots.length].y}%`,
                '--mx': `${mobileSpots[i % mobileSpots.length].x}%`,
                '--my': `${mobileSpots[i % mobileSpots.length].y}%`,
                '--size': `${sizeFor(unit)}px`,
                '--delay': `${330 + i * 70}ms`,
              } as React.CSSProperties
            }
            aria-label={
              unit.status === 'locked'
                ? `第 ${unit.index} 关，${unit.titleZh}，未解锁`
                : `第 ${unit.index} 关，${unit.titleZh}，${
                    unit.status === 'done' ? '已完成' : '继续学习'
                  }`
            }
            onClick={() => onSelectUnit?.(unit)}
          >
            <span className={styles.badge}>
              <svg className={styles.icon} aria-hidden="true">
                <use href={`#${iconFor(unit)}`} />
              </svg>
              {unit.status === 'done' && (
                <svg className={styles.check} aria-hidden="true">
                  <use href="#i-check" />
                </svg>
              )}
              {unit.status === 'locked' && (
                <svg className={styles.lockMini} aria-hidden="true">
                  <use href="#i-lock" />
                </svg>
              )}
            </span>
            <span className={styles.label}>
              {unit.titleZh}
              {unit.status === 'current' && (
                <span className={styles.play} aria-hidden="true">
                  <svg>
                    <use href="#i-play" />
                  </svg>
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* 吉祥物：只在孩子档渲染 */}
      {cfg.mascot && (
        <div className={styles.coach} aria-hidden="true">
          <svg className={styles.coachStar} viewBox="0 0 100 100">
            <path
              d="M50 7l12.2 24.8 27.3 4-19.8 19.2 4.7 27.2L50 69.4 25.6 82.2l4.7-27.2-19.8-19.2 27.3-4z"
              fill="#FFC53D"
              stroke="#E7A100"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            <circle cx="41.5" cy="42.5" r="3.6" fill="#12233F" />
            <circle cx="58.5" cy="42.5" r="3.6" fill="#12233F" />
            <path
              d="M42.5 53c4.6 4.2 10.4 4.2 15 0"
              fill="none"
              stroke="#12233F"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
          </svg>
          <div className={styles.bubble}>
            {progress.chestRemaining > 0
              ? `再 ${progress.chestRemaining} 关，宝箱就满啦！`
              : '宝箱满啦，去开开看！'}
          </div>
        </div>
      )}
      {/* 宝箱进度：固定在左下角，与顶部星星总数呼应 */}
      <div className={styles.reward}>
        <span className={styles.rewardChest} aria-hidden="true">
          <svg>
            <use href="#i-chest" />
          </svg>
        </span>
        <span className={styles.rewardCopy}>
          <span className={styles.rewardText}>
            {interpolate(t.learn.chestProgress, { count: progress.chestRemaining })}
          </span>
          <span className={styles.rewardTrack} aria-hidden="true">
            <span style={{ width: `${Math.min(100, ((5 - progress.chestRemaining) / 5) * 100)}%` }} />
          </span>
        </span>
      </div>
    </div>
  );
}
