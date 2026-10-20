import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 开发态浮标会挡住学习端左下角的宝箱进度，截图核对时一律关掉
  devIndicators: false,
  // antd 与 @ant-design/icons 走 ESM 按需转译，避免整包进入产物
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/charts'],
};

export default nextConfig;
