'use client';

import { Card } from 'antd';
import Link from 'next/link';

export default function ParentAccountPage() {
  return (
    <div className="page-wrap">
      <h1 className="page-title">账号与订阅</h1>
      <Card>
        <p>当前方案、订单、发票。</p>
        <p>
          <Link href="/parent">← 返回学习周报</Link>
        </p>
      </Card>
    </div>
  );
}
