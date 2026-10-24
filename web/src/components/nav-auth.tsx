'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import styles from './nav-auth.module.css';

/**
 * 营销页导航右侧的登录态区。
 *
 * 为什么单独一个客户端组件：首页是服务端组件（首屏地图要 SSR 进 HTML），
 * 不能整个变成客户端组件，只能把「依赖登录态的这一小块」拆出来。
 */
export function NavAuth({ loginLabel, trialLabel }: { loginLabel: string; trialLabel: string }) {
  const { user, ready } = useAuth();

  return (
    <div className={styles.wrap}>
      {/* ready 之前不渲染，避免「登录」字样闪一下又变成用户名 */}
      {ready && user ? (
        <>
          <Link href="/learn" className={styles.user} title={user.name}>
            <span className={styles.avatar} aria-hidden="true">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <span className={styles.name}>{user.name}</span>
          </Link>
          <Link href="/parent" className={styles.ghost}>
            家长端
          </Link>
        </>
      ) : (
        <Link href="/login" className={styles.ghost}>
          {loginLabel}
        </Link>
      )}
      <Link href="/trial" className={styles.cta}>
        {trialLabel}
      </Link>
    </div>
  );
}
