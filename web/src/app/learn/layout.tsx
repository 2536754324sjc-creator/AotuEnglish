import { LearnNav } from '@/components/learn-nav';
import styles from './layout.module.css';

/**
 * 学习端统一布局。
 * 底部导航只在地图与子页出现；答题页由 LearnNav 内部自行隐藏，
 * 保证做题时画面不被导航分心。
 */
export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.body}>{children}</div>
      <LearnNav />
    </div>
  );
}
