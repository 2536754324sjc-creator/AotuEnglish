'use client';

import { useState } from 'react';
import { Table, Segmented, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DailyMinutesChart } from '@/features/parent/daily-minutes-chart';
import { MasteryBars } from '@/features/parent/mastery-bars';
import { mockTodayProgress, mockWeeklyReport, mockReportRows } from '@/lib/mock-data';
import type { ReportRow } from '@/lib/types';
import styles from './report.module.css';

const report = mockWeeklyReport;
const rows = mockReportRows;

const detailColumns: ColumnsType<ReportRow> = [
  { title: '日期', dataIndex: 'day', key: 'day', width: 90 },
  { title: '单元', dataIndex: 'unit', key: 'unit' },
  {
    title: '题目数',
    dataIndex: 'questions',
    key: 'questions',
    width: 90,
    align: 'right',
  },
  {
    title: '正确率',
    dataIndex: 'accuracy',
    key: 'accuracy',
    width: 100,
    align: 'right',
    render: (v: number) => `${v}%`,
  },
  {
    title: '时长',
    dataIndex: 'minutes',
    key: 'minutes',
    width: 80,
    align: 'right',
    render: (v: number) => `${v} 分钟`,
  },
];

export default function ParentReportPage() {
  const [week, setWeek] = useState<string>('本周');

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>
            本周 · {mockTodayProgress.learnerName}
          </h1>
          <p className={styles.range}>{report.weekLabel}</p>
        </div>
        <Segmented
          value={week}
          onChange={setWeek}
          options={['本周', '上周', '更早']}
          className={styles.weeks}
        />
      </header>

      {/* 一屏主角：三个数字，不是三张卡 */}
      <section className={styles.stats} aria-label="本周概览">
        <div className={styles.stat}>
          <span className={styles.statValue}>{report.minutes}</span>
          <span className={styles.statLabel}>学习分钟</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {report.unitsDone}
            <span className={styles.statDivider}>/</span>
            {report.unitsTotal}
          </span>
          <span className={styles.statLabel}>完成单元</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{report.streakDays}</span>
          <span className={styles.statLabel}>连续天数</span>
        </div>
      </section>

      {/* 趋势 */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>每日时长</h2>
        <DailyMinutesChart data={report.dailyMinutes} />
      </section>

      {/* 短板 */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>薄弱环节</h2>
        {report.weakSounds.length > 0 ? (
          <ul className={styles.weak}>
            {report.weakSounds.map((w) => (
              <li key={w.sound} className={styles.weakItem}>
                <span className={styles.sound}>{w.sound}</span>
                <span className={styles.weakNote}>{w.noteZh}</span>
                <Button
                  type="primary"
                  size="small"
                  className={styles.weakBtn}
                  href="/learn"
                >
                  去练一练
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.none}>暂未发现明显薄弱项</p>
        )}
      </section>

      {/* 掌握 */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>单元掌握</h2>
        <MasteryBars data={report.unitMastery} />
      </section>

      {/* 明细 */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>明细</h2>
        <Table<ReportRow>
          columns={detailColumns}
          dataSource={rows}
          rowKey={(r) => r.day + r.unit}
          pagination={false}
          size="middle"
          className={styles.table}
        />
      </section>
    </div>
  );
}
