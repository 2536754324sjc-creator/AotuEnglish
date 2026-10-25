import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth-server';
import { prisma } from '@/lib/db';

/**
 * GET /api/users/me/account —— 账号与订阅（家长端 /parent/account）
 *
 * 支付尚未接入，所以这里**只读**：方案信息与订单记录。
 * 没有下单接口，也没有任何假的「升级」入口。
 */
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: '请先登录' } },
      { status: 401 },
    );
  }

  const full = await prisma.user.findUnique({
    where: { id: user.id },
    include: { account: { include: { invoices: { orderBy: { date: 'desc' } } } } },
  });
  if (!full) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '账号不存在' } },
      { status: 404 },
    );
  }

  const account =
    full.account ?? (await prisma.account.create({ data: { userId: user.id } }));
  const invoices = 'invoices' in account && Array.isArray(account.invoices) ? account.invoices : [];

  return NextResponse.json({
    email: full.email,
    name: full.name,
    planId: account.planId,
    planName: account.planName,
    cycle: account.cycle,
    renewsAt: account.renewsAt ? account.renewsAt.toISOString() : null,
    invoices: invoices.map((i: { id: string; date: Date; amount: number; status: string; planName: string }) => ({
      id: i.id,
      date: i.date.toISOString().slice(0, 10),
      amount: i.amount,
      status: i.status,
      planName: i.planName,
    })),
  });
}
