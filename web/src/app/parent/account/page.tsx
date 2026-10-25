'use client';

import Link from 'next/link';
import { Button, Tag, Table, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { Invoice } from '@/lib/parent-types';
import { PageError, PageLoading } from '@/components/page-states';
import styles from '../settings-shared.module.css';

const invoiceColumns: ColumnsType<Invoice> = [
  { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
  { title: '方案', dataIndex: 'planName', key: 'planName' },
  {
    title: '金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 110,
    align: 'right',
    render: (v: number) => `¥${v}`,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (s: Invoice['status']) => {
      const map = {
        paid: { color: 'green', text: '已支付' },
        refunded: { color: 'default', text: '已退款' },
        pending: { color: 'orange', text: '待支付' },
      } as const;
      const m = map[s];
      return <Tag color={m.color}>{m.text}</Tag>;
    },
  },
];

/**
 * 账号与订阅。
 *
 * 注意：**支付尚未接入**（按项目安排排在最后）。
 * 这里刻意不画「升级 / 取消订阅」这类会失败的操作按钮 ——
 * 点了没反应比明确说明更糟。等支付渠道定了再来接。
 */
export default function ParentAccountPage() {
  const { data, error, loading, reload } = useApi(() => api.getAccount(), []);

  if (loading) return <PageLoading label="正在读取账号信息…" />;
  if (error || !data)
    return <PageError error={error ?? new Error('账号数据缺失')} onRetry={reload} />;

  const isFree = data.planId === 'free';

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>账号与订阅</h1>
          <p className={styles.sub}>当前方案、订单记录与账号信息。</p>
        </div>
      </header>

      <section className={styles.block}>
        <h2 className={styles.blockTitle}>账号</h2>
        <div className={styles.row}>
          <div className={styles.rowMain}>
            <span className={styles.rowLabel}>登录邮箱</span>
            <span className={styles.rowDesc}>{data.email}</span>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.rowMain}>
            <span className={styles.rowLabel}>显示名</span>
            <span className={styles.rowDesc}>{data.name}</span>
          </div>
        </div>
      </section>

      <section className={styles.block}>
        <h2 className={styles.blockTitle}>当前方案</h2>
        <div className={styles.row}>
          <div className={styles.rowMain}>
            <span className={styles.rowLabel}>
              {data.planName}
              {!isFree && (
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {data.cycle === 'yearly' ? '按年' : '按月'}
                </Tag>
              )}
            </span>
            <span className={styles.rowDesc}>
              {isFree
                ? '免费体验版权限有限，不保存学习记录。'
                : data.renewsAt
                  ? `下次续费：${data.renewsAt.slice(0, 10)}`
                  : '当前周期内可正常使用。'}
            </span>
          </div>
          <div className={styles.rowControl}>
            <Button href="/pricing">查看方案对比</Button>
          </div>
        </div>

        <Alert
          type="info"
          showIcon
          style={{ marginTop: 16 }}
          title="在线支付尚未开通"
          description="目前还不能在站内购买或取消订阅。需要调整方案请先联系客服；支付功能会在后续版本上线。"
        />
      </section>

      <section className={styles.block}>
        <h2 className={styles.blockTitle}>订单记录</h2>
        <p className={styles.blockHint}>只显示已产生的订单，没有订单时为空。</p>
        <Table<Invoice>
          columns={invoiceColumns}
          dataSource={data.invoices}
          rowKey="id"
          pagination={false}
          size="middle"
          locale={{ emptyText: '还没有订单记录' }}
        />
      </section>

      <p className={styles.note}>
        需要导出账单或开发票？<Link href="/help">在帮助页看看常见问题</Link>。
      </p>
    </div>
  );
}
