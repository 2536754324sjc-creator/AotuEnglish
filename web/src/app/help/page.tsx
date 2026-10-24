import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqJsonLd, SiteJsonLd } from '@/components/json-ld';
import styles from './help.module.css';

/**
 * 帮助页。
 *
 * 为什么现在补：首页/价格页的导航有「帮助」链接，但 `/help` 路由从没实现过，
 * 每个营销页都会在控制台留一条 404。这里给一个最小可用的 FAQ，
 * 内容取自产品已确定的事实（分层、周报口径、隐私边界），不编造未定的政策。
 */

export const metadata: Metadata = {
  title: '帮助',
  description: '常见问题：适合几岁、怎么学、答错会不会扣星、家长能看到什么、价格与订阅。',
  alternates: { canonical: '/help' },
  openGraph: {
    title: '帮助 · AotuEnglish',
    description: '常见问题：适合几岁、怎么学、家长能看到什么、价格与订阅。',
    url: '/help',
  },
};

type Faq = { q: string; a: string };

const FAQS: { group: string; items: Faq[] }[] = [
  {
    group: '开始使用',
    items: [
      {
        q: '几岁的孩子可以用？',
        a: '4 岁到成人都能用。内容分四档：4–7 岁大图少字、7–12 岁短句、13–16 岁文字为主、17+ 信息密集。同一套页面，按档位切换密度。',
      },
      {
        q: '要先注册吗？',
        a: '不用。首页的「免费体验一节课」不注册、不留信息，直接做第 1 题，玩完才问要不要保存这份记录。',
      },
      {
        q: '每天要花多久？',
        a: '一关约 5 分钟，每天建议完成 1–2 关。学习地图上会显示今日进度和宝箱进度，到点就可以停。',
      },
    ],
  },
  {
    group: '怎么学',
    items: [
      {
        q: '答错了会扣星星吗？',
        a: '不会。答错不扣星、不判负，可以无限重试，直到答对才进入下一题。这是刻意的设计——低龄学习者的重点是敢开口，不是一次做对。',
      },
      {
        q: '有哪些练习形式？',
        a: '听音选图、点读跟读、读一读选答案，以及分级读物（一句一页，可点词朗读）。复习会按到期时间把学过的内容重新排一遍。',
      },
      {
        q: '发音是真人录的吗？',
        a: '词卡用的是标准发音音频，已预先下载到本地，点开即响、不依赖网络；句子走语音合成。',
      },
    ],
  },
  {
    group: '家长端',
    items: [
      {
        q: '家长能看到什么？',
        a: '只看事实：学习时长、完成单元数、连续天数、每日分布，以及需要加强的发音或单元。没有排行榜，不公开比较，也不用「落后」这类词。',
      },
      {
        q: '周报什么时候出？',
        a: '每周一生成上一周的周报。可以切换查看本周和上周。',
      },
      {
        q: '孩子的时间数据会被公开吗？',
        a: '不会。学习数据只在你自己的账号里，不对外展示、不参与任何排名。',
      },
    ],
  },
  {
    group: '价格与订阅',
    items: [
      {
        q: '可以按月付吗？',
        a: '可以，月付和年付都能选。年付按实价折算折扣，页面上显示的就是最终价格。',
      },
      {
        q: '一个账号可以给几个孩子用？',
        a: '价格页有多学习者方案。每个学习者有独立的地图进度和周报。',
      },
    ],
  },
];

export default function HelpPage() {
  // 把分组 FAQ 拍平，交给结构化数据
  const allFaqs = FAQS.flatMap((s) => s.items);

  return (
    <div className={styles.page}>
      <SiteJsonLd />
      <FaqJsonLd items={allFaqs} />
      <header className={styles.head}>
        <Link href="/" className={styles.brand}>
          AotuEnglish
        </Link>
        <nav className={styles.nav}>
          <Link href="/courses" className={styles.navLink}>
            课程
          </Link>
          <Link href="/pricing" className={styles.navLink}>
            价格
          </Link>
          <Link href="/trial" className={styles.cta}>
            免费体验一节课
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>帮助</h1>
        <p className={styles.lead}>常见问题。没找到答案可以直接发邮件问我们。</p>

        {FAQS.map((section) => (
          <section key={section.group} className={styles.section}>
            <h2 className={styles.group}>{section.group}</h2>
            <dl className={styles.list}>
              {section.items.map((item) => (
                <div key={item.q} className={styles.item}>
                  <dt className={styles.q}>{item.q}</dt>
                  <dd className={styles.a}>{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <section className={styles.contact}>
          <h2 className={styles.group}>还没解决？</h2>
          <p className={styles.a}>
            发邮件到{' '}
            <a href="mailto:support@aotuenglish.com">support@aotuenglish.com</a>
            ，我们会尽快回复。
          </p>
          <Link href="/trial" className={styles.primary}>
            先免费试一节课
          </Link>
        </section>
      </main>
    </div>
  );
}
