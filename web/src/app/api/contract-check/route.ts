import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

/**
 * 契约自测端点 —— 仅开发/CI 使用。
 *
 * 为什么做成 route 而不是独立脚本：
 * 项目用 `moduleResolution: bundler`，源码里 import 不带扩展名，
 * Node 直接跑 TS 会解析失败。走 Next 的编译链就复用了真实的构建配置，
 * 测的就是生产构建出的那份代码。
 *
 * 启用：NEXT_PUBLIC_API_MODE=mock 下默认关闭，需要 CO_TRACE_ENABLED=1
 * 访问：GET /api/__contract-check  →  返回逐条校验结果
 */

function ok(name: string, pass: boolean, detail = '') {
  return { name, pass, detail };
}

export async function GET() {
  if (process.env.CONTRACT_CHECK !== '1') {
    return NextResponse.json({ error: '未启用。用 CONTRACT_CHECK=1 启动服务' }, { status: 404 });
  }

  const results: ReturnType<typeof ok>[] = [];

  const progress = await api.getProgress();
  const allQuestions = progress.units.flatMap((u) => u.questions);

  // §7 题目
  // 选择型题需要多个选项；单卡型题（点读/跟读）天然只有 1 个——契约按题型区分
  const SINGLE_OPTION = new Set(['tap_to_read', 'repeat_word']);
  const multi = allQuestions.filter((q) => !SINGLE_OPTION.has(q.type));
  const single = allQuestions.filter((q) => SINGLE_OPTION.has(q.type));

  results.push(
    ok(
      `选择型题至少 2 个选项（${multi.length} 道）`,
      multi.every((q) => q.options.length >= 2),
      multi.filter((q) => q.options.length < 2).map((q) => q.id).join(','),
    ),
  );
  results.push(
    ok(
      `单卡型题恰好 1 个选项（${single.length} 道）`,
      single.every((q) => q.options.length === 1),
      single.filter((q) => q.options.length !== 1).map((q) => q.id).join(','),
    ),
  );
  results.push(
    ok(
      '每题恰好 1 个正确答案',
      allQuestions.every((q) => q.options.filter((o) => o.correct).length === 1),
      allQuestions
        .filter((q) => q.options.filter((o) => o.correct).length !== 1)
        .map((q) => q.id)
        .join(','),
    ),
  );

  const pic = allQuestions.filter((q) => q.type === 'listen_choose_image');
  const picWithUrl = pic.filter((q) => q.options.every((o) => !!o.imageUrl));
  // mock 阶段允许为空：前端用 imagePrompt 哈希生成几何占位图（见契约 §3.2）。
  // 这条是「提示」不是「失败」，但上线前必须补齐。
  results.push({
    name: `选图题的 imageUrl 覆盖（${picWithUrl.length}/${pic.length}）`,
    pass: true,
    detail:
      picWithUrl.length === pic.length
        ? '全部有图'
        : `${pic.length - picWithUrl.length} 道用占位图兜底（mock 预期，上线前补齐）`,
  });

  results.push(ok('audioText 非空', allQuestions.every((q) => !!q.audioText?.trim())));

  // §7 单元
  const idx = progress.units.map((u) => u.index);
  const uniqSorted = [...new Set(idx)].sort((a, b) => a - b);
  results.push(
    ok('Unit.index 从 1 连续', uniqSorted.every((v, i) => v === i + 1), uniqSorted.join(',')),
  );
  const currents = progress.units.filter((u) => u.status === 'current').length;
  results.push(ok('最多一个 current', currents <= 1, `有 ${currents} 个`));

  const ids = progress.units.map((u) => u.unitId);
  results.push(ok('unitId 唯一', new Set(ids).size === ids.length));
  results.push(ok('unitId 符合 ^[a-z0-9-]+$', ids.every((i) => /^[a-z0-9-]+$/.test(i))));

  // §4 各接口
  const unit = await api.getUnit(progress.units[0].unitId);
  results.push(ok('getUnit 返回 { unit }', !!unit.unit?.unitId));
  results.push(ok('getUnit.questions 非空', unit.unit.questions.length > 0));

  const courses = await api.getCourses();
  results.push(
    ok('getCourses 分页形状', Array.isArray(courses.items) && typeof courses.total === 'number'),
  );
  results.push(
    ok(
      'course.domain 合法',
      courses.items.every((c) =>
        ['phonics', 'words', 'reading', 'speaking', 'business'].includes(c.domain),
      ),
    ),
  );

  const words = await api.getWords();
  results.push(
    ok(
      'collectedCount 与 items 一致',
      words.collectedCount === words.items.filter((w) => w.collected).length,
      `声明 ${words.collectedCount}`,
    ),
  );

  const readings = await api.getReadings();
  results.push(ok('每本书都有页', readings.items.every((b) => b.pages.length > 0)));

  const review = await api.getReview();
  results.push(
    ok(
      '复习项按 dueDays 降序',
      review.items.every((it, i, arr) => i === 0 || arr[i - 1].dueDays >= it.dueDays),
    ),
  );

  const rewards = await api.getRewards();
  results.push(
    ok('徽章 progress 在 0-1', rewards.badges.every((b) => b.progress >= 0 && b.progress <= 1)),
  );
  results.push(
    ok('chest.claimable 与 remaining 一致', rewards.chest.claimable === (rewards.chest.remaining === 0)),
  );

  const weekly = await api.getWeeklyReport();
  results.push(ok('周报含 report 与 rows', !!weekly.report && Array.isArray(weekly.rows)));

  // §4.6 上报
  const base = {
    unitId: progress.units[0].unitId,
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
  };
  const s3 = await api.submitSession({
    ...base,
    answers: [{ questionId: 'q1', correct: true, attempts: 1, elapsedMs: 800 }],
  });
  results.push(ok('全对得 3 星', s3.stars === 3, `实际 ${s3.stars}`));

  const s1 = await api.submitSession({
    ...base,
    answers: [
      { questionId: 'q1', correct: true, attempts: 1, elapsedMs: 800 },
      { questionId: 'q2', correct: false, attempts: 3, elapsedMs: 1500 },
      { questionId: 'q3', correct: false, attempts: 2, elapsedMs: 1200 },
    ],
  });
  results.push(ok('错 2 题得 1 星', s1.stars === 1, `实际 ${s1.stars}`));

  // §1.1 错误
  let errName = '';
  let errCode = '';
  let clientErr = false;
  try {
    await api.getUnit('not-exist');
  } catch (e) {
    const err = e as { name?: string; code?: string; isClientError?: boolean };
    errName = err.name ?? '';
    errCode = err.code ?? '';
    clientErr = !!err.isClientError;
  }
  results.push(ok('不存在的单元抛 ApiError', errName === 'ApiError', errName));
  results.push(ok('错误码 NOT_FOUND', errCode === 'NOT_FOUND', errCode));
  results.push(ok('404 判定为客户端错误', clientErr));

  const failed = results.filter((r) => !r.pass);
  return NextResponse.json(
    {
      通过: results.length - failed.length,
      失败: failed.length,
      明细: results,
    },
    { status: failed.length ? 500 : 200 },
  );
}
