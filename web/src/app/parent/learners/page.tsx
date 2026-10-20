'use client';

import { Card } from 'antd';
import Link from 'next/link';

export default function ParentLearnersPage() {
  return (
    <div className="page-wrap">
      <h1 className="page-title">学习者</h1>
      <Card>
        <p>增删学习者档案、切换当前学习者。</p>
        <p>
          <Link href="/parent">← 返回学习周报</Link>
        </p>
      </Card>
    </div>
  );
}
