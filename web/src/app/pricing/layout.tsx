import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '价格',
  description: '三档方案，月付年付均可。年付按实价折算折扣，一个账号可管理多个学习者。',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: '价格 · AotuEnglish',
    description: '三档方案，月付年付均可。一个账号可管理多个学习者。',
    url: '/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
