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

  return (
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
        label={{
          text: 'minutes',
          style: { fill: '#40567a', fontSize: 12, fontWeight: 700 },
        }}
      />
    </div>
  );
}
