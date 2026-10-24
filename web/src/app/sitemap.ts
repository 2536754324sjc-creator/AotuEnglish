import type { MetadataRoute } from 'next';
import { PUBLIC_ROUTES, SITE_URL } from '@/lib/site';

/**
 * sitemap.xml
 *
 * 只列公开营销页。学习端（/learn/*）、家长端（/parent/*）、登录页都不列：
 * 它们要么需要登录，要么是私人数据，收录进 sitemap 只会拉低站点质量分。
 *
 * 数据来自 `lib/site.ts` 的 PUBLIC_ROUTES —— 与页面 metadata 同源，
 * 新增公开页时只要在那里加一条，sitemap 和标题描述会一起更新。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path === '/' ? '' : route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
