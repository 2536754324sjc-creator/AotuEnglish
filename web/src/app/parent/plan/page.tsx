'use client';

import { useEffect, useState } from 'react';
import { Button, InputNumber, Select, Slider, message } from 'antd';
import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { ALL_LEVELS, LEVEL_META } from '@/lib/parent-types';
import type { StudyPlan } from '@/lib/parent-types';
import { PageError, PageLoading } from '@/components/page-states';
import styles from '../settings-shared.module.css';

const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

/**
 * 学习计划：设定内容档、每日目标与提醒节奏。
 *
 * 这里只调参数，不替孩子做决定 —— 计划是家长和算法之间的约定，
 * 周报页只负责「按事实汇报有没有做到」，不做评价（产品原则见 HANDOFF §一）。
 */
export default function ParentPlanPage() {
  const { data, error, loading, reload } = useApi(() => api.getPlan(), []);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string>('');
  const [msg, msgHolder] = message.useMessage();

  // 数据到达后灌入本地编辑态；之后以本地为准，避免每次输入都重新拉
  useEffect(() => {
    if (data) setPlan(data);
  }, [data]);

  if (loading) return <PageLoading label="正在读取学习计划…" />;
  if (error || !plan) return <PageError error={error ?? new Error('计划数据缺失')} onRetry={reload} />;

  const patch = (p: Partial<StudyPlan>) => {
    setPlan((prev) => (prev ? { ...prev, ...p } : prev));
    setSavedAt('');
  };

  const save = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      const next = await api.savePlan(plan);
      setPlan(next);
      setSavedAt(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
      msg.success('计划已保存');
    } catch (e) {
      msg.error(e instanceof Error ? e.message : '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const toggleRest = (day: number) => {
    const has = plan.restDays.includes(day);
    patch({
      restDays: has ? plan.restDays.filter((d) => d !== day) : [...plan.restDays, day].sort(),
    });
  };

  return (
    <div className={styles.page}>
      {msgHolder}

      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>学习计划</h1>
          <p className={styles.sub}>设定节奏。周报会按这里的计划对照实际完成情况。</p>
        </div>
      </header>

      {/* 内容档 */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>内容档</h2>
        <p className={styles.blockHint}>
          决定界面密度与题目难度。页面不随档位增删，同一套课程靠这一项切换。
        </p>
        <div className={styles.levels} role="radiogroup" aria-label="内容档">
          {ALL_LEVELS.map((lv) => {
            const meta = LEVEL_META[lv];
            const on = plan.level === lv;
            return (
              <button
                key={lv}
                type="button"
                role="radio"
                aria-checked={on}
                className={`${styles.levelCard} ${on ? styles.levelCardOn : ''}`}
                onClick={() => patch({ level: lv })}
              >
                <span className={styles.levelName}>{meta.label}</span>
                <span className={styles.levelAges}>{meta.ages}</span>
                <span className={styles.levelBlurb}>{meta.blurb}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 每日目标 */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>每日目标</h2>
        <p className={styles.blockHint}>目标只作为提醒，不设惩罚。没做到不影响任何解锁。</p>

        <div className={styles.row}>
          <div className={styles.rowMain}>
            <span className={styles.rowLabel}>每天学习分钟</span>
            <span className={styles.rowDesc}>建议 10–20 分钟，低龄档不宜过长</span>
          </div>
          <div className={styles.rowControl}>
            <Slider
              min={5}
              max={45}
              step={5}
              value={plan.dailyMinutes}
              onChange={(v: number) => patch({ dailyMinutes: v })}
              style={{ width: 220 }}
              tooltip={{ formatter: (v) => `${v} 分钟` }}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.rowMain}>
            <span className={styles.rowLabel}>每天目标星数</span>
            <span className={styles.rowDesc}>每关最多 3 星，全对才满星</span>
          </div>
          <div className={styles.rowControl}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <InputNumber
                min={1}
                max={15}
                value={plan.dailyStars}
                onChange={(v) => patch({ dailyStars: v ?? 1 })}
                style={{ width: 100 }}
                aria-label="每天目标星数"
              />
              <span>颗</span>
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.rowMain}>
            <span className={styles.rowLabel}>每周学习天数</span>
            <span className={styles.rowDesc}>按这个天数去算周目标的完成率</span>
          </div>
          <div className={styles.rowControl}>
            <Select
              value={plan.daysPerWeek}
              onChange={(v) => patch({ daysPerWeek: v })}
              style={{ width: 130 }}
              options={[3, 4, 5, 6, 7].map((d) => ({ value: d, label: `${d} 天` }))}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.rowMain}>
            <span className={styles.rowLabel}>休息日</span>
            <span className={styles.rowDesc}>休息日不提醒，也不计入完成率</span>
          </div>
          <div className={styles.rowControl}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DAY_LABELS.map((label, day) => {
                const on = plan.restDays.includes(day);
                return (
                  <Button
                    key={day}
                    size="small"
                    type={on ? 'primary' : 'default'}
                    onClick={() => toggleRest(day)}
                    aria-pressed={on}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.rowMain}>
            <span className={styles.rowLabel}>每天提醒</span>
            <span className={styles.rowDesc}>到点发一条提醒；留空表示不提醒</span>
          </div>
          <div className={styles.rowControl}>
            <Select
              allowClear
              placeholder="不提醒"
              value={plan.remindAt || undefined}
              onChange={(v) => patch({ remindAt: v ?? '' })}
              style={{ width: 150 }}
              options={[
                '07:30',
                '08:00',
                '16:30',
                '17:30',
                '18:30',
                '19:30',
                '20:00',
                '20:30',
              ].map((t) => ({ value: t, label: t }))}
            />
          </div>
        </div>
      </section>

      <div className={styles.actions}>
        <Button type="primary" size="large" loading={saving} onClick={save}>
          保存计划
        </Button>
        {savedAt && <span className={styles.saved}>已保存 · {savedAt}</span>}
      </div>
    </div>
  );
}
