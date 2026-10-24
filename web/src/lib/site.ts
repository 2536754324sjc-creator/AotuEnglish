/**
 * 站点级配置 —— SEO 相关的唯一事实来源。
 *
 * 为什么集中在这里：canonical、sitemap、OG 图、结构化数据都要用同一个域名。
 * 散落在各页面里，换域名时会漏改，导致 canonical 指向错误地址（SEO 里很致命）。
 */

/** 站点根地址。部署到正式域名时改这里，或设 NEXT_PUBLIC_SITE_URL */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://aotuenglish.com'
).replace(/\/$/, '');

export const SITE_NAME = 'AotuEnglish';

export const SITE_TAGLINE = '每天 15 分钟，真的开口';

export const SITE_DESCRIPTION =
  '一张看得见进度的英语学习地图。4 岁到成人，按内容分层，闯关式练习，家长看得见每周进步。';

/** 默认分享图（1200×630，Open Graph 标准尺寸） */
export const OG_IMAGE = '/og.png';

/** 需要被搜索引擎收录的公开页面 */
export const PUBLIC_ROUTES: {
  path: string;
  title: string;
  description: string;
  priority: number;
  changeFrequency: 'daily' | 'weekly' | 'monthly';
}[] = [
  {
    path: '/',
    title: 'AotuEnglish · 每天 15 分钟，真的开口',
    description: SITE_DESCRIPTION,
    priority: 1,
    changeFrequency: 'weekly',
  },
  {
    path: '/courses',
    title: '课程体系 · AotuEnglish',
    description:
      '按年龄分层、按领域筛选的英语课程：自然拼读、高频词、分级阅读、日常口语、商务英语，共 9 门课覆盖 4 岁到成人。',
    priority: 0.9,
    changeFrequency: 'weekly',
  },
  {
    path: '/pricing',
    title: '价格 · AotuEnglish',
    description:
      '三档方案，月付年付均可。年付按实价折算折扣，一个账号可管理多个学习者。',
    priority: 0.9,
    changeFrequency: 'monthly',
  },
  {
    path: '/trial',
    title: '免费体验一节课 · AotuEnglish',
    description: '不注册、不留信息，直接做第一题。玩完再决定要不要保存这份记录。',
    priority: 0.8,
    changeFrequency: 'monthly',
  },
  {
    path: '/help',
    title: '帮助 · AotuEnglish',
    description:
      '常见问题：适合几岁、怎么学、答错会不会扣星、家长能看到什么、价格与订阅。',
    priority: 0.6,
    changeFrequency: 'monthly',
  },
];
