'use client';

import Link from 'next/link';
import { ApiError } from '@/lib/api';
import styles from './page-states.module.css';

/**
 * 页面的加载态与错误态。
 *
 * 为什么统一：接后端后每个数据页都有三种状态（加载中 / 出错 / 有数据），
 * 各页各写一套会导致样式不一、错误提示质量参差。这里给一套默认实现，
 * 需要特殊文案的页面再传 props 覆盖。
 */

export function PageLoading({ label = '加载中…' }: { label?: string }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <p className={styles.label}>{label}</p>
    </div>
  );
}

export function PageError({
  error,
  onRetry,
  backHref = '/learn',
  backLabel = '回到学习地图',
}: {
  error: unknown;
  onRetry?: () => void;
  backHref?: string;
  backLabel?: string;
}) {
  const apiError = error instanceof ApiError ? error : null;

  // 按错误类型给不同的文案：404 重试没用，网络错误重试才有意义
  let title = '出了点问题';
  let desc = '请稍后再试一次。';
  let canRetry = true;

  if (apiError?.status === 404) {
    title = '这一页找不到了';
    desc = '内容可能已经下架，或者链接不对。';
    canRetry = false;
  } else if (apiError?.status === 403) {
    title = '还没有解锁';
    desc = '先完成前面的关卡，这里就会打开。';
    canRetry = false;
  } else if (apiError?.status === 0 || apiError?.code === 'NETWORK') {
    title = '网络连接不上';
    desc = '检查一下网络，然后再试。';
  } else if (apiError?.isClientError) {
    title = '请求没有成功';
    desc = apiError.message;
    canRetry = false;
  }

  return (
    <div className={styles.wrap} role="alert">
      <div className={styles.art} aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M12 7.5v5.5M12 16.2v.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.desc}>{desc}</p>
      <div className={styles.actions}>
        {canRetry && onRetry && (
          <button type="button" className={styles.primary} onClick={onRetry}>
            重试
          </button>
        )}
        <Link href={backHref} className={styles.secondary}>
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
