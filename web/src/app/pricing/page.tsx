'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Segmented, Tag } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { IconSprite } from '@/components/icon-sprite';
import styles from './pricing.module.css';

type Plan = {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  /** 年付时每月折合 */
  highlight?: boolean;
  desc: string;
  features: string[];
  cta: string;
  ctaHref: string;
};

const plans: Plan[] = [
  {
    id: 'free',
    name: '体验版',
    priceMonthly: 0,
    priceYearly: 0,
    desc: '先玩一关看看',
    features: ['1 个体验单元', '听音选图与点读', '基础学习地图', '不保存学习记录'],
    cta: '免费体验',
    ctaHref: '/trial',
  },
  {
    id: 'family',
    name: '家庭版',
    priceMonthly: 39,
    priceYearly: 29,
    highlight: true,
    desc: '一个孩子，完整内容',
    features: [
      '全部四档内容（4 岁到成人）',
      '每日学习地图与闯关',
      '四种题型：听音选图/点读/选择/完形',
      '学习周报与薄弱项分析',
      '复习与词卡',
    ],
    cta: '开始订阅',
    ctaHref: '/signup',
  },
  {
    id: 'family-plus',
    name: '多孩家庭',
    priceMonthly: 69,
    priceYearly: 49,
    desc: '最多 4 个学习者',
    features: [
      '家庭版全部功能',
      '最多 4 个学习档案',
      '每个孩子独立进度与周报',
      '家长端统一管理',
      '优先客服',
    ],
    cta: '开始订阅',
    ctaHref: '/signup',
  },
];

export default function PricingPage() {
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');

  /**
   * 年付折扣按最低档算，保证「省 X%」对每一档都成立。
   * 不能写死 25%：家庭版实际省 26%、多孩版省 29%，写 25% 属于低估，
   * 但如果新增一档折扣更低的，写死就会变成虚标。
   */
  const paidPlans = plans.filter((p) => p.priceMonthly > 0);
  const minDiscount = paidPlans.length
    ? Math.min(
        ...paidPlans.map((p) =>
          Math.floor((1 - p.priceYearly / p.priceMonthly) * 100),
        ),
      )
    : 0;

  return (
    <div className={styles.page}>
      <IconSprite />

      <header className={styles.head}>
        <Link href="/" className={styles.brand}>
          AotuEnglish
        </Link>
        <nav className={styles.nav}>
          <Link href="/courses" className={styles.navLink}>
            课程
          </Link>
          <Link href="/trial" className={styles.cta}>
            免费体验一节课
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>价格</h1>
          <p className={styles.lead}>先免费玩一关，觉得合适再订阅。随时可取消。</p>
        </section>

        <div className={styles.cycleWrap}>
          <Segmented
            size="large"
            value={cycle}
            onChange={(v) => setCycle(v as 'monthly' | 'yearly')}
            options={[
              { label: '按月', value: 'monthly' },
              { label: `按年（省 ${minDiscount}% 起）`, value: 'yearly' },
            ]}
          />
        </div>

        <ul className={styles.grid}>
          {plans.map((plan) => {
            const price = cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            const isFree = price === 0;
            return (
              <li
                key={plan.id}
                className={`${styles.card} ${plan.highlight ? styles.cardHighlight : ''}`}
              >
                {plan.highlight && (
                  <Tag color="blue" className={styles.badge}>
                    最受欢迎
                  </Tag>
                )}
                <h2 className={styles.planName}>{plan.name}</h2>
                <p className={styles.planDesc}>{plan.desc}</p>

                <div className={styles.priceRow}>
                  {isFree ? (
                    <span className={styles.price}>免费</span>
                  ) : (
                    <>
                      <span className={styles.currency}>¥</span>
                      <span className={styles.price}>{price}</span>
                      <span className={styles.unit}>/ 月</span>
                    </>
                  )}
                </div>
                {!isFree && cycle === 'yearly' && (
                  <p className={styles.billedNote}>
                    按年付费 ¥{price * 12} · 比月付省{' '}
                    {Math.round((1 - plan.priceYearly / plan.priceMonthly) * 100)}%
                  </p>
                )}
                {isFree && <p className={styles.billedNote}>不需要任何付费信息</p>}

                <ul className={styles.features}>
                  {plan.features.map((f) => (
                    <li key={f}>
                      <CheckOutlined className={styles.check} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`${styles.planCta} ${plan.highlight ? styles.planCtaPrimary : ''}`}
                >
                  {plan.cta}
                </Link>
              </li>
            );
          })}
        </ul>

        <section className={styles.faq}>
          <h2 className={styles.faqTitle}>常见问题</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>可以先试用吗？</dt>
              <dd>可以。不用注册就能完整玩一关，觉得合适再注册。</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>孩子年龄小，能用吗？</dt>
              <dd>
                4 岁起就能用。内容按四档分层，同一套产品，界面密度和题目难度跟着档位调整。
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>随时可以取消吗？</dt>
              <dd>可以。取消后当前付费周期内仍可使用，到期不再扣费。</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>支持几个孩子？</dt>
              <dd>家庭版 1 个学习者，多孩家庭版最多 4 个，每个孩子独立进度。</dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}
