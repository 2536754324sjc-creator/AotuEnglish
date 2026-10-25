import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth-server';
import { prisma } from '@/lib/db';
import { SERVER_UNITS, WORD_META, unitWords } from '@/lib/server/units';

/**
 * GET /api/users/me/words —— 词卡及收集状态（契约 §4.7）
 *
 * 收集状态来自 LearnerWord 表：只有真正学过的单元里的词才被标记为已收集。
 * 这与前端 mock 的推导规则一致，但现在由数据库决定，跨设备一致。
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

  const collected = new Set<string>();
  if (learner) {
    const rows = await prisma.learnerWord.findMany({
      where: { learnerId: learner.id },
      select: { word: true },
    });
    for (const r of rows) collected.add(r.word);
  }

  // 词卡来源：所有单元词表的并集，按单元分组
  const seen = new Set<string>();
  const items: {
    word: string;
    phonetic: string;
    meaningZh: string;
    unitZh: string;
    collected: boolean;
    level: string;
  }[] = [];

  for (const u of SERVER_UNITS) {
    for (const word of unitWords(u)) {
      if (seen.has(word)) continue;
      seen.add(word);
      items.push({
        word,
        phonetic: WORD_META[word]?.phonetic ?? '',
        meaningZh: WORD_META[word]?.meaningZh ?? '',
        unitZh: u.titleZh,
        collected: collected.has(word),
        level: u.level,
      });
    }
  }

  return NextResponse.json({
    items,
    total: items.length,
    collectedCount: items.filter((i) => i.collected).length,
  });
}
