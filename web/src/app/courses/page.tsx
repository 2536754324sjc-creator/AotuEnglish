'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Segmented, Empty, Tag } from 'antd';
import { mockCourses } from '@/lib/mock-data';
import { levels } from '@/design/tokens';
import type { Level } from '@/design/tokens';
import type { Course } from '@/lib/types';
import styles from './courses.module.css';

const levelOptions = [
  { label: '全部', value: 'all' },
  { label: '4–7 岁', value: 'kids-a' },
  { label: '7–12 岁', value: 'kids-b' },
  { label: '13–16 岁', value: 'teen' },
  { label: '17+', value: 'adult' },
];

const domainLabels: Record<Course['domain'], string> = {
  phonics: '自然拼读',
  words: '词汇',
  reading: '阅读',
  speaking: '口语',
  business: '商务',
};

/**
 * 领域筛选的固定顺序。
 * 不能用 Set 去重再转数组——Set 的迭代顺序虽在 V8 里是插入序，
 * 但服务端与客户端遍历同一份数据时这里容易产生不一致的 key，
 * 曾导致 hydration 文本不匹配。用显式数组最稳。
 */
const DOMAIN_ORDER: Course['domain'][] = [
  'phonics',
  'words',
  'reading',
  'speaking',
  'business',
];

export default function CoursesPage() {
  const [level, setLevel] = useState<string>('all');
  const [domain, setDomain] = useState<string>('all');

  const filtered = useMemo(() => {
    return mockCourses.filter((c) => {
      const okLevel = level === 'all' || c.level === level;
      const okDomain = domain === 'all' || c.domain === domain;
      return okLevel && okDomain;
    });
  }, [level, domain]);

  // 只保留数据里真实存在的领域，且顺序固定
  const domains = useMemo(
    () => DOMAIN_ORDER.filter((d) => mockCourses.some((c) => c.domain === d)),
    [],
  );

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <Link href="/" className={styles.brand}>
          AotuEnglish
        </Link>
        <nav className={styles.nav}>
          <Link href="/trial" className={styles.cta}>
            免费体验一节课
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>课程体系</h1>
          <p className={styles.lead}>
            从 4 岁听音选图，到成人商务场景。同一个产品，按内容档调整密度与难度。
          </p>
        </section>

        <section className={styles.filters} aria-label="筛选">
          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>年龄</span>
            <Segmented value={level} onChange={(v) => setLevel(String(v))} options={levelOptions} />
          </div>
          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>领域</span>
            <Segmented
              value={domain}
              onChange={(v) => setDomain(String(v))}
              options={[
                { label: '全部', value: 'all' },
                ...domains.map((d) => ({ label: domainLabels[d], value: d })),
              ]}
            />
          </div>
        </section>

        <p className={styles.count} aria-live="polite">
          共 {filtered.length} 门课程
        </p>

        {filtered.length === 0 ? (
          <Empty
            className={styles.empty}
            description="这个组合下还没有课程"
          >
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => {
                setLevel('all');
                setDomain('all');
              }}
            >
              换个条件看看
            </button>
          </Empty>
        ) : (
          <ul className={styles.grid}>
            {filtered.map((c) => (
              <li key={c.slug}>
                <Link href={`/trial`} className={styles.card}>
                  <span className={styles.cardTop}>
                    <Tag color="blue" className={styles.tag}>
                      {levels[c.level as Level]?.label ?? c.level}
                    </Tag>
                    <span className={styles.domain}>{domainLabels[c.domain]}</span>
                  </span>
                  <strong className={styles.cardTitle}>{c.titleZh}</strong>
                  <span className={styles.cardEn}>{c.titleEn}</span>
                  <span className={styles.cardMeta}>{c.unitCount} 个单元</span>
                  <span className={styles.cardAction}>先试听一节 →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
