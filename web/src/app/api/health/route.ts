import { NextResponse } from 'next/server';
import { prisma, isPostgresUrl } from '@/lib/db';

/**
 * GET /api/health —— 健康检查（监控探活 + 上线验证）
 *
 * 这个接口是公开的，所以**不返回业务数据**（早期版本返回了用户总数，
 * 任何人都能据此判断产品规模，属于不必要的泄露）。
 * 只给：是否健康、用的哪种数据库、当前时间。
 *
 * 返回码约定：
 * - 200：应用与数据库都正常
 * - 503：数据库连不上（监控应据此告警）
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();
  try {
    // 最轻量的连通性探针：只查一条
    await prisma.user.findFirst({ select: { id: true } });

    return NextResponse.json(
      {
        ok: true,
        db: isPostgresUrl(process.env.DATABASE_URL ?? '') ? 'postgresql' : 'sqlite',
        ms: Date.now() - startedAt,
        time: new Date().toISOString(),
      },
      {
        // 健康检查不能被任何层级缓存，否则监控会拿到过期结果
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        // 只回粗粒度原因：详细错误（含连接串片段）不应暴露给公网
        error: 'database_unreachable',
        time: new Date().toISOString(),
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
