'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from './api';

/**
 * 异步取数 hook —— 只给客户端组件用。
 *
 * 为什么单独一个文件（而不是放在 api.ts 里）：
 * `api.ts` 同时被服务端组件（首页 SSR、/api/contract-check）引用，
 * 而它一旦 import 了 React hooks，Next 会因 RSC 边界报错：
 *   "You're importing a module that depends on `useState` into a React Server Component"
 * 所以纯数据层（api.ts）与 React 绑定（本文件）必须分开。
 *
 * 用法：
 *   const { data, error, loading, reload } = useApi(() => api.getWords(), []);
 *
 * 注意：第一个参数是 loader 函数，依赖放第二个参数（和 useMemo 一样）。
 * loader 用到的变量必须出现在依赖里，否则会拿到旧闭包。
 */

export type ApiState<T> = {
  data: T | null;
  error: ApiError | Error | null;
  loading: boolean;
  reload: () => void;
};

export function useApi<T>(loader: () => Promise<T>, deps: unknown[] = []): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  // 组件卸载后不再 setState，避免 React 警告与内存泄漏
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // loader 每次渲染都是新函数，不能直接进依赖；由调用方显式给 deps
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    setLoading(true);
    setError(null);

    loaderRef
      .current()
      .then((res) => {
        if (!alive.current) return;
        setData(res);
      })
      .catch((e) => {
        if (!alive.current) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (alive.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, error, loading, reload };
}
