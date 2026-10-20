'use client';

import { Card } from 'antd';
import Link from 'next/link';

export default function ParentSettingsPage() {
  return (
    <div className="page-wrap">
      <h1 className="page-title">学习偏好</h1>
      <Card>
        <p>每天目标、免打扰时段、提醒开关。</p>
        <p>只提醒，不拦截。</p>
        <p>
          <Link href="/parent">← 返回学习周报</Link>
        </p>
      </Card>
    </div>
  );
}
