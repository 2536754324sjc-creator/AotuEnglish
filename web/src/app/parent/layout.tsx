'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { BarChartOutlined, TeamOutlined, SettingOutlined, CreditCardOutlined } from '@ant-design/icons';
import { RequireAuth } from '@/components/require-auth';
import styles from './parent.module.css';

const { Sider, Content } = Layout;

const items: MenuProps['items'] = [
  { key: '/parent', icon: <BarChartOutlined />, label: <Link href="/parent">学习周报</Link> },
  { key: '/parent/plan', icon: <BarChartOutlined />, label: <Link href="/parent/plan">学习计划</Link> },
  { key: '/parent/learners', icon: <TeamOutlined />, label: <Link href="/parent/learners">学习者</Link> },
  { key: '/parent/settings', icon: <SettingOutlined />, label: <Link href="/parent/settings">学习偏好</Link> },
  { key: '/parent/account', icon: <CreditCardOutlined />, label: <Link href="/parent/account">账号与订阅</Link> },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <Layout className={styles.shell}>
      <header className={styles.top}>
        <Link href="/" className={styles.brand}>
          AotuEnglish
        </Link>
        <span className={styles.tag}>家长端</span>
        <Link href="/learn" className={styles.exit}>
          回到学习地图
        </Link>
      </header>
      <Layout className={styles.body}>
        <Sider width={216} className={styles.sider} theme="light">
          <Menu
            mode="inline"
            items={items}
            selectedKeys={[pathname]}
            className={styles.menu}
          />
        </Sider>
        <Content className={styles.content}>
          <RequireAuth>{children}</RequireAuth>
        </Content>
      </Layout>
    </Layout>
  );
}
