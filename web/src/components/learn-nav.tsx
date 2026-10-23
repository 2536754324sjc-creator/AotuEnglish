'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './learn-nav.module.css';

type Item = {
  href: string;
  label: string;
  icon: string;
  /** 未实现功能显示成灰色但可点，点了给说明 */
  done: boolean;
};

const items: Item[] = [
  { href: '/learn', label: '地图', icon: 'i-map', done: true },
  { href: '/learn/words', label: '词卡', icon: 'i-card', done: true },
  { href: '/learn/reading', label: '读物', icon: 'i-book', done: true },
  { href: '/learn/review', label: '复习', icon: 'i-review', done: true },
  { href: '/learn/speak', label: '跟读', icon: 'i-mic', done: true },
  { href: '/learn/rewards', label: '奖励', icon: 'i-chest', done: true },
];

/**
 * 学习端底部导航。
 * 只在「地图」页出现 —— 答题页与结算页要保持全屏专注，不能被导航分心。
 */
export function LearnNav() {
  const pathname = usePathname();

  // 只在 /learn 及其子页显示；答题页（/learn/unit/*）不显示
  if (pathname.startsWith('/learn/unit')) return null;

  return (
    <nav className={styles.nav} aria-label="学习区导航">
      {items.map((item) => {
        const active =
          item.href === '/learn' ? pathname === '/learn' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.item} ${active ? styles.active : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <svg aria-hidden="true">
              <use href={`#${item.icon}`} />
            </svg>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
