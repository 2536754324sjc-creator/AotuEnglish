'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * 前端认证状态管理。
 *
 * 设计要点：
 * - token 存 localStorage：刷新页面不掉登录态；不做 httpOnly cookie 是因为
 *   当前没有后端，mock 模式要能独立跑通。接后端后建议改成 httpOnly cookie（见文件末）。
 * - 登录态用一个极简的「订阅」机制广播：登录/登出后，监听方（导航栏、路由守卫）能同步刷新。
 * - 不在这个文件里发请求，请求统一走 `api.ts`，这里只管状态。
 *
 * 契约对应：docs/api-contract.md §4.1 `POST /auth/login`
 */

export type AuthUser = {
  id: string;
  name: string;
  level: 'kids-a' | 'kids-b' | 'teen' | 'adult';
  role: 'learner' | 'parent';
};

export type AuthSession = {
  token: string;
  expiresAt: string;
  user: AuthUser;
};

const TOKEN_KEY = 'aotu.token';
const USER_KEY = 'aotu.user';
const EXPIRES_KEY = 'aotu.expiresAt';

/* ---------------- 订阅机制 ---------------- */

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  for (const fn of listeners) fn();
}

/** 订阅登录态变化，返回取消订阅函数 */
export function subscribeAuth(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/* ---------------- 读写 ---------------- */

/** 服务端渲染时 localStorage 不存在，一律当作未登录 */
function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getToken(): string | null {
  if (!canUseStorage()) return null;
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  // 过期就清掉，避免拿一个失效 token 反复请求
  const expiresAt = window.localStorage.getItem(EXPIRES_KEY);
  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
    clearSession();
    return null;
  }
  return token;
}

export function getCurrentUser(): AuthUser | null {
  if (!canUseStorage()) return null;
  if (!getToken()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    // 存储被改坏时不要崩，当作未登录
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(TOKEN_KEY, session.token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  window.localStorage.setItem(EXPIRES_KEY, session.expiresAt);
  emit();
}

export function clearSession(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(EXPIRES_KEY);
  emit();
}

/* ---------------- React 绑定 ---------------- */

/**
 * 当前登录态。`ready` 用来区分「还在读 localStorage」与「确实未登录」，
 * 否则路由守卫会在首帧误判成未登录、把已登录用户踢回登录页。
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 首次读取放在 effect 里：服务端渲染拿不到 localStorage，避免 hydration 不一致
    setUser(getCurrentUser());
    setReady(true);
    return subscribeAuth(() => setUser(getCurrentUser()));
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, []);

  return { user, ready, isLoggedIn: !!user, logout };
}
