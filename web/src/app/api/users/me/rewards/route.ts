import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth-server';
import { prisma } from '@/lib/db';

/**
 * GET /api/users/me/rewards —— 徽章 + 宝箱 + 商店（契约 §4.11）
 *
 * 现状：宝箱与徽章按星星数推导；商店仍为占位（HANDOFF §三 第 6 项：
 * 装扮商店是 P2 内容，后端也未定义兑换接口）。
 * 这里**不假造**可兑换的商品，明确标注 available: false。
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

  const learner =
    (await prisma.learner.findFirst({ where: { userId: user.id, active: true } })) ??
    (await prisma.learner.findFirst({ where: { userId: user.id } }));

  let starTotal = 0;
  let chestRemaining = 0;
  let badges: string[] = [];
  let doneUnits = 0;
  let collectedWords = 0;

  if (learner) {
    const progress = await prisma.learnerProgress.findUnique({
      where: { learnerId: learner.id },
    });
    const rewards = await prisma.learnerRewards.findUnique({
      where: { learnerId: learner.id },
    });
    starTotal = progress?.starTotal ?? 0;
    chestRemaining = rewards?.chestRemaining ?? 0;
    badges = rewards ? safeArray(rewards.badgesJson) : [];
    doneUnits = progress ? safeArray(progress.doneUnitsJson).length : 0;
    collectedWords = await prisma.learnerWord.count({ where: { learnerId: learner.id } });
  }

  /**
   * 徽章解锁条件按各自语义判定，**不是**单纯的星星里程碑。
   *
   * 之前写成「每 15 星一枚」，导致刚完成第一关的孩子一枚徽章都没有 ——
   * 而第一枚徽章的文案明明写着「完成第一关」。条件与文案必须一致，
   * 否则家长会觉得系统没在记录。
   *
   * 已解锁的徽章会持久化到 LearnerRewards.badgesJson 吗？
   * 目前不写：条件完全由当前数据推导，是幂等的。
   * 一旦某天加了「限时活动」类徽章（条件不能从数据推导），再改为落库。
   */
  const earnedIds = new Set(badges);
  const cond: Record<string, { met: boolean; need: number; have: number }> = {
    starter: { met: doneUnits >= 1, need: 1, have: doneUnits },
    listener: { met: starTotal >= 10, need: 10, have: starTotal },
    reader: { met: doneUnits >= 3, need: 3, have: doneUnits },
    colours: { met: collectedWords >= 12, need: 12, have: collectedWords },
    streak: { met: starTotal >= 21, need: 21, have: starTotal },
    wordsmith: { met: collectedWords >= 50, need: 50, have: collectedWords },
  };

  const badgeList = BADGE_DEFS.map((b) => {
    const c = cond[b.id] ?? { met: false, need: 1, have: 0 };
    return {
      id: b.id,
      nameZh: b.nameZh,
      descZh: b.descZh,
      earned: earnedIds.has(b.id) || c.met,
      // 通用单位（关 / 星 / 词），界面按徽章类型展示进度
      progress: { have: c.have, need: c.need },
    };
  });

  return NextResponse.json({
    badges: badgeList,
    chest: { remaining: chestRemaining, total: 3 },
    shop: SHOP_PLACEHOLDERS,
  });
}

const BADGE_DEFS = [
  { id: 'starter', nameZh: '第一步', descZh: '完成第一关' },
  { id: 'listener', nameZh: '小耳朵', descZh: '听音选图连续答对 10 题' },
  { id: 'reader', nameZh: '小书虫', descZh: '读完一本书' },
  { id: 'colours', nameZh: '颜色大师', descZh: '收集全部颜色词' },
  { id: 'streak', nameZh: '坚持一周', descZh: '连续 7 天学习' },
  { id: 'wordsmith', nameZh: '词汇达人', descZh: '收集 50 个词' },
];

/**
 * 装扮商店占位项。
 *
 * available: false 是刻意的：兑换接口尚未设计，
 * 若显示为可点击却点了没反应，比明确写「暂未开放」更糟。
 */
const SHOP_PLACEHOLDERS = [
  { id: 'hat-sun', nameZh: '太阳帽', costStars: 20, available: false },
  { id: 'pet-cat', nameZh: '小猫伙伴', costStars: 40, available: false },
  { id: 'bg-sky', nameZh: '天空背景', costStars: 60, available: false },
];

function safeArray(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
