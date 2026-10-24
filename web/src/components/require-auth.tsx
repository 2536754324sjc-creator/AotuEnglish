'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PageLoading } from '@/components/page-states';
import { useAuth } from '@/lib/auth';

/**
 * 路由守卫：未登录时跳到 /login，并带上 ?next= 以便登录后回到原页面。
 *
 * 为什么做成组件而不是 middleware：
 * - middleware 跑在服务端，读不到 localStorage 里的 token（那是客户端存储）
 * - 当前 token 存在 localStorage，只能在客户端判断
 *
 * ⚠️ 接入真实后端后，应改为 httpOnly cookie + 服务端 middleware，
 * 那样守卫在 HTML 返回前就生效，用户不会看到一闪而过的受保护内容。
 *
 * 注意：这只是 UX 层的保护，**真正的权限校验必须在服务端做**。
 * 前端守卫挡不住手改 localStorage 的人。
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ready 之前不做判断：否则首帧会把已登录用户误判成未登录
    if (!ready || isLoggedIn) return;
    const next = encodeURIComponent(pathname || '/');
    router.replace(`/login?next=${next}`);
  }, [ready, isLoggedIn, router, pathname]);

  // 还没读完 localStorage，或正在跳转：显示加载态，不闪受保护内容
  if (!ready || !isLoggedIn) {
    return <PageLoading label="正在确认登录状态…" />;
  }

  return <>{children}</>;
}
