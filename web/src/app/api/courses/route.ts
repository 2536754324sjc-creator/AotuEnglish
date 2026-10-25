import { NextResponse } from 'next/server';

/**
 * GET /api/courses —— 课程列表（契约 §4.2）
 *
 * 课程是公开营销内容，不需要登录（首页 SSR 也用它）。
 * 支持 level / domain 过滤与分页，与契约的参数一致。
 */
export const dynamic = 'force-dynamic';

const COURSES = [
  { slug: 'phonics-starter', titleZh: '自然拼读入门', titleEn: 'Phonics Starter', level: 'kids-a', domain: 'phonics', unitCount: 24 },
  { slug: 'first-words', titleZh: '高频词 200', titleEn: 'First 200 Words', level: 'kids-a', domain: 'words', unitCount: 32 },
  { slug: 'farm-animals', titleZh: '农场动物', titleEn: 'Farm Animals', level: 'kids-a', domain: 'words', unitCount: 12 },
  { slug: 'phonics-plus', titleZh: '拼读进阶', titleEn: 'Phonics Plus', level: 'kids-b', domain: 'phonics', unitCount: 28 },
  { slug: 'reading-starters', titleZh: '分级阅读起步', titleEn: 'Reading Starters', level: 'kids-b', domain: 'reading', unitCount: 20 },
  { slug: 'teen-reading', titleZh: '青少年阅读', titleEn: 'Teen Reading', level: 'teen', domain: 'reading', unitCount: 18 },
  { slug: 'teen-speaking', titleZh: '口语表达', titleEn: 'Teen Speaking', level: 'teen', domain: 'speaking', unitCount: 16 },
  { slug: 'business-email', titleZh: '商务邮件', titleEn: 'Business Email', level: 'adult', domain: 'business', unitCount: 14 },
  { slug: 'business-meetings', titleZh: '商务会议', titleEn: 'Business Meetings', level: 'adult', domain: 'business', unitCount: 12 },
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const level = url.searchParams.get('level');
  const domain = url.searchParams.get('domain');
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') ?? 20) || 20));

  let items = COURSES;
  if (level) items = items.filter((c) => c.level === level);
  if (domain) items = items.filter((c) => c.domain === domain);

  const total = items.length;
  const start = (page - 1) * pageSize;

  return NextResponse.json({
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  });
}
