'use client';

import { Card } from 'antd';
import Link from 'next/link';

export default function ParentPlanPage() {
  return (
    <div className="page-wrap">
      <h1 className="page-title">学习计划</h1>
      <Card>
        <p>设置内容档、每天目标时长与学习目标。</p>
        <p>
          <Link href="/parent">← 返回学习周报</Link>
        </p>
      </Card>
    </div>
  );
}
