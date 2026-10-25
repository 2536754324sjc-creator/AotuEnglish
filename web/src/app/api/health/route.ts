import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * 健康检查：确认数据库能连上。
 *
 * 上线后监控可以直接打这个接口（返回 200 即健康），
 * 所以它不是临时调试代码，而是要长期保留的。
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.count();
    return NextResponse.json({ ok: true, users, time: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : '数据库连接失败',
      },
      { status: 503 },
    );
  }
}
