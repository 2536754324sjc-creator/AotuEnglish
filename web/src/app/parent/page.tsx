import type { Metadata } from 'next';
import ParentReportPage from './report';

/**
 * 家长端 noindex。
 *
 * 家长端全是登录后的私人数据（孩子的学习记录），
 * 收录进搜索既无价值也有隐私风险。
 *
 * 注意：这里导出 metadata 而不是在 layout.tsx 里 ——
 * parent/layout.tsx 是客户端组件（用了 usePathname 做菜单高亮），不能导出 metadata。
 */
export const metadata: Metadata = {
  title: '学习周报',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default ParentReportPage;
