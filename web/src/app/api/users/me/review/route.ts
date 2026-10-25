import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth-server';
import { prisma } from '@/lib/db';
import { WORD_META } from '@/lib/server/units';

/**
 * GET /api/users/me/review —— 到期复习项（契约 §4.10）
 *
 * 返回形状与前端 `ReviewItem` 一致（lib/mock-review.ts）：
 *   { id, fromUnitZh, dueDays, question }
 * 这样前端复习页切 live 时不需要改渲染代码。
 *
 * 数据来源是 ReviewItem 表：作答时答错过的词会进入队列。
 * 排序：dueDays 越大越先复习，其次错误次数多的优先。
 *
 * 复习算法：当前是最朴素的「答错即入队，dueDays=1」。
 * 契约 §10 第 4 条留了 SM-2 / FSRS 的选择，替换时只改本文件。
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

  if (!learner) {
    return NextResponse.json({ items: [], total: 0 });
  }

  const rows = await prisma.reviewItem.findMany({
    where: { learnerId: learner.id, dueDays: { gte: 1 } },
    orderBy: [{ dueDays: 'desc' }, { wrongCount: 'desc' }],
    take: 50,
  });

  const items = rows.map((r) => {
    const meta = WORD_META[r.word];
    /**
     * 复习题：读词选义。
     *
     * 为什么选项不带 correct：复习页复用前端答题机，
     * 而服务端判分模式下 correct 不再下发（契约 §10 第 5 条）。
     * 复习本身是「打开即练」，不产生新的星星，所以这里两个选项都标 false，
     * 不会导致「答不对」—— 前端复习页走的是自己的完成逻辑，不依赖判分。
     * 干扰项取「其它意思」而非编造一个具体词义，避免误导。
     */
    const question = {
      id: `${r.id}-q`,
      type: 'read_choose',
      promptZh: '选出正确的意思',
      audioText: r.word,
      options: [
        { id: 'a', text: meta?.meaningZh ?? r.word, correct: false },
        { id: 'b', text: '其它意思', correct: false },
      ],
    };

    return {
      id: r.id,
      fromUnitZh: r.unitZh,
      dueDays: r.dueDays,
      question,
    };
  });

  return NextResponse.json({ items, total: items.length });
}
