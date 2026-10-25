import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth-server';
import { prisma } from '@/lib/db';

/**
 * GET/PUT /api/users/me/preferences —— 提醒与体验偏好（家长端 /parent/settings）
 *
 * 这些开关只影响提醒方式，不影响学习本身（产品原则：只提醒，不拦截）。
 */
export const dynamic = 'force-dynamic';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function GET(req: Request) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: '请先登录' } },
      { status: 401 },
    );
  }

  const pref = await prisma.userPreference.findUnique({ where: { userId: user.id } });
  if (pref) {
    return NextResponse.json({
      weeklyReportEmail: pref.weeklyReportEmail,
      dailyReminder: pref.dailyReminder,
      quietStart: pref.quietStart,
      quietEnd: pref.quietEnd,
      soundEffects: pref.soundEffects,
      locale: pref.locale,
    });
  }

  const created = await prisma.userPreference.create({ data: { userId: user.id } });
  return NextResponse.json({
    weeklyReportEmail: created.weeklyReportEmail,
    dailyReminder: created.dailyReminder,
    quietStart: created.quietStart,
    quietEnd: created.quietEnd,
    soundEffects: created.soundEffects,
    locale: created.locale,
  });
}

export async function PUT(req: Request) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: '请先登录' } },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAM', message: '请求体不是合法 JSON' } },
      { status: 400 },
    );
  }

  const time = (v: unknown, fallback: string) =>
    typeof v === 'string' && TIME_RE.test(v) ? v : fallback;

  // 只支持中文。传 en 时**明确拒绝**而不是静默改成 zh ——
  // 静默丢弃用户的选择会让人以为设置生效了（前端也把英文标为即将支持）。
  if (body.locale === 'en') {
    return NextResponse.json(
      { error: { code: 'NOT_SUPPORTED', message: '英文界面即将支持，暂不能切换' } },
      { status: 400 },
    );
  }

  const data = {
    weeklyReportEmail: body.weeklyReportEmail !== false,
    dailyReminder: body.dailyReminder === true,
    quietStart: time(body.quietStart, '21:00'),
    quietEnd: time(body.quietEnd, '07:00'),
    soundEffects: body.soundEffects !== false,
    locale: 'zh',
  };

  const saved = await prisma.userPreference.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  });

  return NextResponse.json({
    weeklyReportEmail: saved.weeklyReportEmail,
    dailyReminder: saved.dailyReminder,
    quietStart: saved.quietStart,
    quietEnd: saved.quietEnd,
    soundEffects: saved.soundEffects,
    locale: saved.locale,
  });
}
