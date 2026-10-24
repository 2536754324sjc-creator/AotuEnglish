'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * 图卡图片：WebP 优先，JPG 回退。
 *
 * ⚠️ 为什么不用 `<picture>`：
 * `<source type="image/webp">` 只做「格式是否受支持」的协商。
 * 一旦浏览器支持 WebP 并选中该 source，**加载失败不会回退到 img 的 src**
 * —— 这是 `<picture>` 的规范行为（source 匹配后不再尝试其它源）。
 * 实测：拦截 .webp 后 7 张图全破，JPG 一次都没被请求。
 *
 * 为什么也不「先 JPG 再切 WebP」：
 * 那样每张图会先后请求 JPG 和 WebP 两次，带宽翻倍（实测 7 张图产生 14 个请求）。
 *
 * 最终方案：
 * 1. 模块级缓存一次「是否支持 WebP」（canvas.toDataURL 探测，不联网）
 * 2. 首帧就输出正确后缀，不产生重复请求
 * 3. 万一 WebP 加载失败（漏生成等），单张回退 JPG
 */

let webpSupported: boolean | undefined;

/** 同步探测 WebP 支持；结果缓存在模块级，全站只算一次 */
function supportsWebp(): boolean {
  if (webpSupported !== undefined) return webpSupported;
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    // 支持 WebP 的浏览器这里返回 data:image/webp
    webpSupported = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    webpSupported = false;
  }
  return webpSupported;
}

type Props = {
  /** 词 slug，对应 public/cards/{slug}.{webp,jpg} */
  slug: string;
  alt: string;
  /** 首屏图片设 true，其余懒加载 */
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
  draggable?: boolean;
  /** 图片加载失败时回调，用于回落到占位图 */
  onError?: () => void;
};

export function CardImage({
  slug,
  alt,
  priority = false,
  className,
  width = 1024,
  height = 1024,
  draggable = false,
  onError,
}: Props) {
  const ref = useRef<HTMLImageElement>(null);
  // 默认 JPG：SSR 阶段没有 canvas，必须先给一个一定能用的地址。
  // 客户端挂载后立刻探测并切换 —— 这一步发生在浏览器发起图片请求之前，
  // 所以不会像「先请求 JPG 再请求 WebP」那样浪费带宽。
  const [useWebp, setUseWebp] = useState(false);
  const [fallback, setFallback] = useState(false);

  /**
   * 用 useLayoutEffect：它在浏览器绘制前同步执行，
   * 能在第一张图真正发请求前就把 src 换成 WebP。
   * 用 useEffect 的话浏览器已经先请求了 JPG，导致每张图多一次请求
   * （实测 7 张图产生 14 个请求）。
   * 服务端渲染阶段用 useEffect 的空实现，避免 SSR 警告。
   */
  const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsoLayoutEffect(() => {
    setUseWebp(supportsWebp());
  }, []);

  const src = useWebp && !fallback ? `/cards/${slug}.webp` : `/cards/${slug}.jpg`;

  useEffect(() => {
    // 兜底：图片可能在 React 挂上 onError 之前就失败了（缓存里的 404），
    // 那样不会触发回调，这里在挂载后主动查一次。
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) {
      if (useWebp && !fallback) setFallback(true);
      else onError?.();
    }
  }, [src, useWebp, fallback, onError]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      draggable={draggable}
      onError={() => {
        // WebP 失败先回退 JPG；JPG 也失败才交给调用方的占位图
        if (useWebp && !fallback) setFallback(true);
        else onError?.();
      }}
    />
  );
}
