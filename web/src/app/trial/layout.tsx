import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '免费体验一节课',
  description: '不注册、不留信息，直接做第一题。玩完再决定要不要保存这份记录。',
  alternates: { canonical: '/trial' },
  openGraph: {
    title: '免费体验一节课 · AotuEnglish',
    description: '不注册、不留信息，直接做第一题。',
    url: '/trial',
  },
};

export default function TrialLayout({ children }: { children: React.ReactNode }) {
  return children;
}
