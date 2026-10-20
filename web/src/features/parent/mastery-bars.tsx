'use client';

import type { WeeklyReport } from '@/lib/types';
import { getDict } from '@/i18n';
import styles from './mastery-bars.module.css';

const t = getDict('zh');

type Props = {
  data: WeeklyReport['unitMastery'];
};

/**
 * 单元掌握：横向条形。
 * 用 DOM 而不是图表库——它只需要读「哪个单元高/低」，
 * 一个紧凑的行内条比坐标轴更快，也省一个重依赖。
 */
export function MasteryBars({ data }: Props) {
  if (data.length === 0) {
    return <p className={styles.empty}>还没有可统计的单元</p>;
  }

  const sorted = [...data].sort((a, b) => b.percent - a.percent);

  return (
    <ul className={styles.list}>
      {sorted.map((row) => (
        <li key={row.unit} className={styles.row}>
          <span className={styles.name}>{row.unit}</span>
          <span className={styles.track}>
            <span
              className={styles.fill}
              style={{ width: `${row.percent}%` }}
              data-low={row.percent < 60 || undefined}
            />
          </span>
          <span className={styles.value}>{row.percent}%</span>
        </li>
      ))}
    </ul>
  );
}

export { t as reportT };
