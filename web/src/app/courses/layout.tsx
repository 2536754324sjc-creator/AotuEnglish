import type { Metadata } from 'next';
import { CoursesJsonLd, SiteJsonLd } from '@/components/json-ld';
import { mockCourses } from '@/lib/mock-data';

/**
 * /courses 的元数据与结构化数据。
 *
 * 为什么单独建 layout 而不写在 page.tsx：
 * page.tsx 是 `'use client'`（有筛选交互），客户端组件不能导出 metadata。
 * 在它外层加一个服务端 layout 是最小改动，页面代码一行不用动。
 *
 * 课程数据直接读 mock：结构化数据在服务端渲染时就要出现在 HTML 里，
 * 不能等客户端异步取（爬虫不一定执行 JS）。
 */

export const metadata: Metadata = {
  title: '课程体系',
  description:
    '按年龄分层、按领域筛选的英语课程：自然拼读、高频词、分级阅读、日常口语、商务英语，共 9 门课覆盖 4 岁到成人。',
  alternates: { canonical: '/courses' },
  openGraph: {
    title: '课程体系 · AotuEnglish',
    description: '9 门课覆盖 4 岁到成人，按年龄分层、按领域筛选。',
    url: '/courses',
  },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteJsonLd />
      <CoursesJsonLd
        courses={mockCourses.map((c) => ({
          titleZh: c.titleZh,
          titleEn: c.titleEn,
          level: c.level,
          unitCount: c.unitCount,
        }))}
      />
      {children}
    </>
  );
}
