import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/site';

/**
 * 结构化数据（JSON-LD）。
 *
 * 为什么用 JSON-LD 而不是微数据：
 * 微数据要写进 HTML 标签，会污染组件结构；JSON-LD 独立成 script，与渲染解耦。
 *
 * 只声明「能如实描述的事实」：
 * - Organization：品牌与站点归属
 * - WebSite：站点名与搜索意图
 * - Course 列表：课程体系页用
 * 不写 aggregateRating —— 现在没有任何真实评分数据，编造评分会被判为垃圾结构化数据。
 */

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD 是受控对象，不是用户输入；用 stringify 而非 dangerouslySetInnerHTML 的拼接
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** 全站通用：品牌 + 站点 */
export function SiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/og.png`,
          width: 1200,
          height: 630,
        },
        description: SITE_DESCRIPTION,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'zh-CN',
      },
    ],
  };

  return <JsonLd data={data} />;
}

/** 课程体系页：把课程列表声明为 ItemList，帮助搜索引擎理解结构 */
export function CoursesJsonLd({
  courses,
}: {
  courses: { titleZh: string; titleEn: string; level: string; unitCount: number }[];
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${SITE_NAME} 课程体系`,
    description: '按年龄分层、按领域筛选的英语课程',
    numberOfItems: courses.length,
    itemListElement: courses.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Course',
        name: c.titleZh,
        alternateName: c.titleEn,
        description: `${c.titleZh}（${c.titleEn}），共 ${c.unitCount} 个单元，适合 ${
          {
            'kids-a': '4–7 岁',
            'kids-b': '7–12 岁',
            teen: '13–16 岁',
            adult: '17 岁以上',
          }[c.level] ?? '全年龄'
        }。`,
        provider: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
        },
        inLanguage: 'zh-CN',
      },
    })),
  };

  return <JsonLd data={data} />;
}

/** 帮助页：FAQ 结构化数据，有机会在搜索结果里直接展开问答 */
export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return <JsonLd data={data} />;
}

/** 首页：把产品定位声明为 EducationalOrganization，配合品牌词搜索 */
export function HomeJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    slogan: SITE_TAGLINE,
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
      audienceType: '4 岁到成人的英语学习者',
    },
  };

  return <JsonLd data={data} />;
}
