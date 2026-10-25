'use client';

import { useEffect, useState } from 'react';
import { Button, Select, Switch, message } from 'antd';
import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { StudyPreferences } from '@/lib/parent-types';
import { PageError, PageLoading } from '@/components/page-states';
import styles from '../settings-shared.module.css';

/**
 * 学习偏好：提醒、免打扰、音效、语言。
 *
 * 这里的开关**只影响提醒**，不影响学习本身 —— 产品原则是「只提醒，不拦截」，
 * 关掉提醒不会锁住任何内容。
 */
export default function ParentSettingsPage() {
  const { data, error, loading, reload } = useApi(() => api.getPreferences(), []);
  const [prefs, setPrefs] = useState<StudyPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState('');
  const [msg, msgHolder] = message.useMessage();

  useEffect(() => {
    if (data) setPrefs(data);
  }, [data]);

  if (loading) return <PageLoading label="正在读取学习偏好…" />;
  if (error || !prefs)
    return <PageError error={error ?? new Error('偏好数据缺失')} onRetry={reload} />;

  const patch = (p: Partial<StudyPreferences>) => {
    setPrefs((prev) => (prev ? { ...prev, ...p } : prev));
    setSavedAt('');
  };

  const save = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      const next = await api.savePreferences(prefs);
      setPrefs(next);
      setSavedAt(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
      msg.success('偏好已保存');
    } catch (e) {
      msg.error(e instanceof Error ? e.message : '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      {msgHolder}

      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>学习偏好</h1>
          <p className={styles.sub}>这些开关只影响提醒方式，不会锁住任何学习内容。</p>
        </div>
      </header>

      <section className={styles.block}>
        <h2 className={styles.blockTitle}>提醒</h2>
        <p className={styles.blockHint}>关掉之后仍然可以随时进入学习，只是不再收到通知。</p>

        <div className={styles.row}>
          <div className={styles.rowMain}>
            <span className={styles.rowLabel}>每天学习提醒</span>
            <span className={styles.rowDesc}>按「学习计划」里设定的时间提醒</span>
          </div>
          <div className={styles.rowControl}>
            <Switch
              checked={prefs.dailyReminder}
              onChange={(v) => patch({ dailyReminder: v })}
              aria-label="每天学习提醒"
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.rowMain}>
            <span className={styles.rowLabel}>每周周报邮件</span>
            <span className={styles.rowDesc}>每周一早上把上周的周报发到邮箱</span>
          </div>
          <div className={styles.rowControl}>
            <Switch
              checked={prefs.weeklyReportEmail}
              onChange={(v) => patch({ weeklyReportEmail: v })}
              aria-label="每周周报邮件"
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.rowMain}>
            <span className={styles.rowLabel}>免打扰时段</span>
            <span className={styles.rowDesc}>这段时间内不发任何提醒</span>
          </div>
          <div className={styles.rowControl}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="time"
                className={styles.timeInput}
                value={prefs.quietStart}
                onChange={(e) => patch({ quietStart: e.target.value })}
                aria-label="免打扰开始时间"
              />
              <span>至</span>
              <input
                type="time"
                className={styles.timeInput}
                value={prefs.quietEnd}
                onChange={(e) => patch({ quietEnd: e.target.value })}
                aria-label="免打扰结束时间"
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.block}>
        <h2 className={styles.blockTitle}>体验</h2>

        <div className={styles.row}>
          <div className={styles.rowMain}>
            <span className={styles.rowLabel}>答题音效</span>
            <span className={styles.rowDesc}>答对时的提示音；关掉不影响发音朗读</span>
          </div>
          <div className={styles.rowControl}>
            <Switch
              checked={prefs.soundEffects}
              onChange={(v) => patch({ soundEffects: v })}
              aria-label="答题音效"
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.rowMain}>
            <span className={styles.rowLabel}>界面语言</span>
            <span className={styles.rowDesc}>目前只有中文文案，英文为后续版本</span>
          </div>
          <div className={styles.rowControl}>
            <Select
              value={prefs.locale}
              onChange={(v) => patch({ locale: v })}
              style={{ width: 140 }}
              options={[
                { value: 'zh', label: '中文' },
                { value: 'en', label: 'English（即将支持）', disabled: true },
              ]}
            />
          </div>
        </div>
      </section>

      <div className={styles.actions}>
        <Button type="primary" size="large" loading={saving} onClick={save}>
          保存偏好
        </Button>
        {savedAt && <span className={styles.saved}>已保存 · {savedAt}</span>}
      </div>
    </div>
  );
}
