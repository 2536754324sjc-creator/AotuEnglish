import type { Metadata } from 'next';
import { LearnNav } from '@/components/learn-nav';
import { RequireAuth } from '@/components/require-auth';
import styles from './layout.module.css';

/**
 * 学习端整段 noindex。
 *
 * 为什么不放进 robots.txt 的 Disallow：
 * Disallow 会让爬虫看不到 noindex 标签，页面仍可能以「只有标题」的形式出现在结果里。
 * noindex 才是「可以抓取，但不要收录」的正确表达。
 *
 * 放在 /learn 的 layout 里，一次覆盖 /learn、/learn/words、/learn/reading、
 * /learn/review、/learn/rewards、/learn/speak、/learn/unit/* 全部子路由。
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

/**
 * 学习端统一布局。
 * 底部导航只在地图与子页出现；答题页由 LearnNav 内部自行隐藏，
 * 保证做题时画面不被导航分心。
 *
 * 整段学习端都要登录：进度、星星、词卡收集、复习排期全部与账号绑定，
 * 未登录时展示这些数据没有意义（也容易被误以为是自己的记录）。
 *
 * 注意 `/trial` 是独立路由，不在此布局下 —— 体验课必须保持免登录，
 * 它是营销入口，「不注册直接玩」是产品承诺。
 */
export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.body}>
        <RequireAuth>{children}</RequireAuth>
      </div>
      <LearnNav />
    </div>
  );
}
