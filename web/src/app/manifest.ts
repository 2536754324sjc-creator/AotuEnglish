import type { MetadataRoute } from 'next';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

/**
 * Web App Manifest —— 让「添加到主屏幕」时像个应用，而不是一个书签。
 *
 * 为什么现在补：根布局的 metadata 里引用了 `/manifest.webmanifest`，
 * 但文件一直不存在，每次访问都会留一条 404。
 *
 * 只声明实际有的资源：没有 192/512 的 PNG 图标，
 * 就用 SVG（现代浏览器支持），避免写一个指向不存在文件的 icons 数组。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} · 每天 15 分钟，真的开口`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#f2f9ff',
    theme_color: '#2f7cf6',
    lang: 'zh-CN',
    dir: 'ltr',
    categories: ['education', 'kids'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
