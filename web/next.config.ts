import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 开发态浮标会挡住学习端左下角的宝箱进度，截图核对时一律关掉
  devIndicators: false,
  // antd 与 @ant-design/icons 走 ESM 按需转译，避免整包进入产物
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/charts'],

  /**
   * Prisma 与 SQLite 驱动是服务端原生模块，不能打进客户端包。
   *
   * 线上走 PostgreSQL 时 better-sqlite3 实际不会被调用，
   * 但 db.ts 会静态 import 它，所以必须标为外部依赖，
   * 否则构建时会尝试打包原生模块并失败。
   */
  serverExternalPackages: [
    '@prisma/client',
    'better-sqlite3',
    '@prisma/adapter-better-sqlite3',
    '@prisma/adapter-pg',
  ],

  /**
   * 基础安全响应头。
   *
   * 这是给孩子用的产品且存了账号，至少要有基础的点击劫持与 MIME 嗅探防护。
   * 没有加 CSP：当前没有任何跨域资源，加了反而要维护白名单；
   * 等有自定义域名与第三方统计需求时再补。
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            // 跟读功能需要麦克风（/learn/speak），其余不需要
            value: 'camera=(), geolocation=(), microphone=(self)',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
