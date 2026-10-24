import type { Metadata } from 'next';

/**
 * 登录页 noindex。
 *
 * 理由：搜索结果里出现登录页对用户没有价值（他们要的是内容页），
 * 且登录页本身没有可索引的正文。
 * robots.txt 里也 Disallow 了 /login，这里是双保险 ——
 * 因为外部链接仍可能指向它，noindex 能确保不被收录。
 */
export const metadata: Metadata = {
  title: '登录',
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
