import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * robots.txt
 *
 * 关键决策：**不屏蔽登录后的学习端与家长端**，改用页面级 noindex。
 *
 * 为什么不用 Disallow：
 * Disallow 会让爬虫完全不抓取，但页面仍可能因外部链接出现在搜索结果里
 * （只有标题没有摘要，体验更差）。noindex 才是「可以抓，但别收录」的正确表达。
 * 而 Disallow + noindex 同时用反而矛盾：爬虫看不到 noindex 标签。
 *
 * 例外：/api/ 与 /login 直接 Disallow —— 接口没有索引价值，
 * 登录页对搜索用户也没有意义（他们要的是内容页）。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/login', '/login?'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
