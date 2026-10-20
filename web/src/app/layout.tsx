import type { Metadata, Viewport } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Providers } from '@/app/providers';
import '@/styles/global.css';

export const metadata: Metadata = {
  title: 'AotuEnglish · 每天 15 分钟，真的开口',
  description:
    '一张看得见进度的英语学习地图。4 岁到成人，按内容分层，闯关式练习，家长看得见每周进步。',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f2f9ff',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <Providers>{children}</Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
