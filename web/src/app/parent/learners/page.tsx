'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Modal, Select, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckCircleFilled } from '@ant-design/icons';
import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { ALL_LEVELS, LEVEL_META } from '@/lib/parent-types';
import type { Learner } from '@/lib/parent-types';
import type { Level } from '@/design/tokens';
import { PageError, PageLoading } from '@/components/page-states';
import styles from '../settings-shared.module.css';

type Draft = {
  id: string | null;
  name: string;
  level: Level;
  birthYear: number | null;
};

const EMPTY_DRAFT: Draft = { id: null, name: '', level: 'kids-a', birthYear: null };

/**
 * 学习者管理：一个账号下最多 4 个学习档案（与 /pricing 的多孩家庭版一致）。
 *
 * 「当前学习者」决定地图、词卡、周报显示谁的数据 —— 所以这里必须有明确的切换入口，
 * 否则多孩家庭会分不清看到的是哪个孩子。
 */
const MAX_LEARNERS = 4;

export default function ParentLearnersPage() {
  const { data, error, loading, reload } = useApi(() => api.getLearners(), []);
  const [list, setList] = useState<Learner[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, msgHolder] = message.useMessage();

  useEffect(() => {
    if (data) setList(data);
  }, [data]);

  if (loading) return <PageLoading label="正在读取学习者…" />;
  if (error) return <PageError error={error} onRetry={reload} />;

  const persist = async (next: Learner[]) => {
    setSaving(true);
    try {
      const saved = await api.saveLearners(next);
      setList(saved);
      return true;
    } catch (e) {
      msg.error(e instanceof Error ? e.message : '保存失败，请重试');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const submitDraft = async () => {
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) {
      msg.warning('给学习者起个名字吧');
      return;
    }
    // 重名会让周报分不清是谁，直接拦住
    const duplicated = list.some((l) => l.name === name && l.id !== draft.id);
    if (duplicated) {
      msg.warning('已经有同名的学习者了');
      return;
    }

    let next: Learner[];
    if (draft.id) {
      next = list.map((l) =>
        l.id === draft.id ? { ...l, name, level: draft.level, birthYear: draft.birthYear } : l,
      );
    } else {
      if (list.length >= MAX_LEARNERS) {
        msg.warning(`最多 ${MAX_LEARNERS} 个学习档案`);
        return;
      }
      next = [
        ...list,
        {
          id: `u_${Date.now()}`,
          name,
          level: draft.level,
          birthYear: draft.birthYear,
          avatar: name.slice(0, 1).toUpperCase(),
          createdAt: new Date().toISOString().slice(0, 10),
          // 第一个自动成为当前学习者
          active: list.length === 0,
        },
      ];
    }

    if (await persist(next)) {
      setDraft(null);
      msg.success('已保存');
    }
  };

  const setActive = async (id: string) => {
    const target = list.find((l) => l.id === id);
    if (await persist(list.map((l) => ({ ...l, active: l.id === id })))) {
      msg.success(`已切换到 ${target?.name ?? '该学习者'}`);
    }
  };

  const remove = async (id: string) => {
    const target = list.find((l) => l.id === id);
    const next = list.filter((l) => l.id !== id);
    // 删掉当前学习者时，把下一个设为当前，避免出现「没有当前学习者」的空状态
    if (target?.active && next.length > 0) next[0] = { ...next[0], active: true };
    if (await persist(next)) {
      msg.success('已删除');
    }
  };

  return (
    <div className={styles.page}>
      {msgHolder}

      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>学习者</h1>
          <p className={styles.sub}>
            每个学习者有独立的地图、词卡与周报。当前显示的是带「当前」标记的那一个。
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          disabled={list.length >= MAX_LEARNERS}
          onClick={() => setDraft({ ...EMPTY_DRAFT })}
        >
          添加学习者
        </Button>
      </header>

      <section className={styles.block}>
        {list.length === 0 ? (
          <p className={styles.empty}>还没有学习档案，先添加一个吧。</p>
        ) : (
          <div className={styles.learnerList}>
            {list.map((l) => (
              <div
                key={l.id}
                className={`${styles.learnerCard} ${l.active ? styles.learnerCardActive : ''}`}
              >
                <div className={styles.avatar} aria-hidden="true">
                  {l.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.learnerName}>
                    {l.name}
                    {l.active && (
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        当前
                      </Tag>
                    )}
                  </div>
                  <div className={styles.learnerMeta}>
                    {LEVEL_META[l.level].label} · {LEVEL_META[l.level].ages}
                  </div>

                  <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
                    {!l.active && (
                      <Button
                        size="small"
                        icon={<CheckCircleFilled />}
                        onClick={() => setActive(l.id)}
                        disabled={saving}
                      >
                        设为当前
                      </Button>
                    )}
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() =>
                        setDraft({ id: l.id, name: l.name, level: l.level, birthYear: l.birthYear })
                      }
                    >
                      编辑
                    </Button>
                    <Popconfirm
                      title="删除这个学习档案？"
                      description="进度和记录会一起删除，不能恢复。"
                      okText="删除"
                      okButtonProps={{ danger: true }}
                      cancelText="取消"
                      onConfirm={() => remove(l.id)}
                    >
                      <Button size="small" danger icon={<DeleteOutlined />} disabled={saving}>
                        删除
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className={styles.note}>
        最多 {MAX_LEARNERS} 个学习档案（对应多孩家庭版）。当前 {list.length} / {MAX_LEARNERS}。
      </p>

      <Modal
        open={Boolean(draft)}
        title={draft?.id ? '编辑学习者' : '添加学习者'}
        okText="保存"
        cancelText="取消"
        confirmLoading={saving}
        onOk={submitDraft}
        onCancel={() => setDraft(null)}
        destroyOnHidden
      >
        {draft && (
          <div style={{ display: 'grid', gap: 16, paddingTop: 8 }}>
            <div>
              <label
                htmlFor="learner-name"
                style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}
              >
                名字
              </label>
              <Input
                id="learner-name"
                value={draft.name}
                maxLength={16}
                placeholder="孩子怎么称呼"
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>

            <div>
              <label
                htmlFor="learner-level"
                style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}
              >
                内容档
              </label>
              <Select
                id="learner-level"
                value={draft.level}
                onChange={(v: Level) => setDraft({ ...draft, level: v })}
                style={{ width: '100%' }}
                options={ALL_LEVELS.map((lv) => ({
                  value: lv,
                  label: `${LEVEL_META[lv].label}（${LEVEL_META[lv].ages}）`,
                }))}
              />
              <p className={styles.note} style={{ marginTop: 6 }}>
                {LEVEL_META[draft.level].blurb}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
