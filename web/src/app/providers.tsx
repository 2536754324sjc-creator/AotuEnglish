'use client';

import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { antdTheme } from '@/design/antd-theme';

/**
 * 全站 Provider。AntD 的 ConfigProvider 是唯一主题所有者，
 * 页面里不要再叠第二个主题系统。
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={antdTheme} locale={zhCN}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
