'use client';

import { useEffect, useRef, useState } from 'react';
import { Column } from '@ant-design/charts';
import type { WeeklyReport } from '@/lib/types';
import styles from './report-charts.module.css';

type Props = {
  data: WeeklyReport['dailyMinutes'];
};

/**
 * 每日时长柱状图。
 * 0 数据时不渲染坐标轴，直接给空态文案 —— 空轴比空态更难读。
 *
 * 关于数值标签：G2 5 的 label 不支持 `position`（源码 shape/label 里明确标着
 * `@todo Support position option`），试过 dy 偏移与 contrastReverse，
 * 都会让文字压在柱子上、或者随柱子高度飘移，可读性反而更差。
 * 所以这里关掉内置标签，改为在图表下方给一行等价的数字摘要：
 * 柱子负责看趋势，摘要负责读具体数值，各司其职。
 */
export function DailyMinutesChart({ data }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    // 等容器有真实尺寸再画，隐藏/折叠时 G2 会拿到 0 宽
    const el = ref.current;
    if (el.clientWidth > 0) {
      setReady(true);
      return;
    }
    const ro = new ResizeObserver(() => {
      if (el.clientWidth > 0) {
        setReady(true);
        ro.disconnect();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (data.length === 0) {
    return <p className={styles.empty}>这周还没有学习记录</p>;
  }

  if (!ready) {
    return <div className={styles.placeholder} ref={ref} aria-hidden="true" />;
  }

  const total = data.reduce((sum, d) => sum + d.minutes, 0);
  const peak = data.reduce((a, b) => (b.minutes > a.minutes ? b : a), data[0]);

  return (
    <div className={styles.chartWrap}>
      <div ref={ref} className={styles.chart}>
        <Column
          data={data}
          xField="day"
          yField="minutes"
          height={220}
          columnWidthRatio={0.45}
          color="#2f7cf6"
          axis={{
            y: { title: '分钟' },
            x: { title: false },
          }}
          // 不用内置 label：会压在柱子上（见文件顶部注释）
          label={false}
          tooltip={{ items: [{ channel: 'y', name: '分钟' }] }}
        />
      </div>

      {/* 数值摘要：替代柱子上的标签，同时给屏幕阅读器可读文本 */}
      <dl className={styles.chartSummary}>
        {data.map((d) => (
          <div key={d.day} className={styles.chartSummaryItem}>
            <dt>{d.day}</dt>
            <dd>{d.minutes}</dd>
          </div>
        ))}
      </dl>

      <p className={styles.chartNote}>
        共 {total} 分钟，最多的一天是{peak.day}（{peak.minutes} 分钟）。
      </p>
    </div>
  );
}
