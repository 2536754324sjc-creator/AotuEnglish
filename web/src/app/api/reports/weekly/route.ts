import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth-server';
import { prisma } from '@/lib/db';
import { SERVER_UNITS, WORD_META } from '@/lib/server/units';

/**
 * GET /api/reports/weekly?week=2026-W43 —— 周报（契约 §4.12）
 *
 * 为什么必须从真实作答数据算：家长端的产品原则是「只讲事实」，
 * 数字如果来自静态 mock，那就是编的。这里全部来自 StudySession 的作答明细。
 *
 * 输出形状对齐前端 WeeklyReport + ReportRow（lib/types.ts）。
 */
export const dynamic = 'force-dynamic';

/** 把 ISO 周（2026-W43）换算成该周的起止时间（周一 00:00 起） */
function isoWeekRange(week: string | null): { start: Date; end: Date; label: string } {
  const now = new Date();
  let year: number;
  let wk: number;

  const m = /^(\d{4})-W(\d{1,2})$/.exec(week ?? '');
  if (m) {
    year = Number(m[1]);
    wk = Number(m[2]);
  } else {
    // 默认本周
    year = now.getFullYear();
    wk = 0;
  }

  if (!wk) {
    // ISO 周号：把周四所在周作为第 1 周
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - dayNum + 3);
    const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    const firstDay = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDay + 3);
    wk = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 864e5));
    year = d.getUTCFullYear();
  }

  // 该年 1 月 4 日所在周为第 1 周
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = (jan4.getUTCDay() + 6) % 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day);

  const start = new Date(week1Monday);
  start.setUTCDate(week1Monday.getUTCDate() + (wk - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);

  return { start, end, label: `${year}-W${String(wk).padStart(2, '0')}` };
}

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

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
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '还没有学习者档案' } },
      { status: 404 },
    );
  }

  const url = new URL(req.url);
  const { start, end, label } = isoWeekRange(url.searchParams.get('week'));

  const sessions = await prisma.studySession.findMany({
    where: { learnerId: learner.id, createdAt: { gte: start, lt: end } },
    orderBy: { createdAt: 'asc' },
  });

  type AnswerDetail = {
    questionId: string;
    correct: boolean;
    attempts: number;
    elapsedMs: number;
  };

  // 每日分钟数
  const dailyMinutes = DAY_LABELS.map((day) => ({ day, minutes: 0 }));
  // 明细行
  const rows: { day: string; unit: string; questions: number; accuracy: number; minutes: number }[] = [];
  // 薄弱项计数器
  const wrongByWord = new Map<string, { count: number; noteZh: string }>();

  let totalMs = 0;
  const doneUnits = new Set<string>();

  for (const s of sessions) {
    const answers = safeParse<AnswerDetail[]>(s.answersJson, []);
    const ms = Math.max(0, s.finishedAt.getTime() - s.startedAt.getTime());
    totalMs += ms;
    const minutes = Math.max(1, Math.round(ms / 60000));

    const d = new Date(s.createdAt);
    const dayIdx = (d.getDay() + 6) % 7; // 周一为 0
    dailyMinutes[dayIdx].minutes += minutes;

    const correctCount = answers.filter((a) => a.correct).length;
    const accuracy = answers.length ? Math.round((correctCount / answers.length) * 100) : 0;

    const unit = SERVER_UNITS.find((u) => u.unitId === s.unitId);
    doneUnits.add(s.unitId);

    rows.push({
      day: `${d.getMonth() + 1}/${d.getDate()}`,
      unit: unit?.titleZh ?? s.unitId,
      questions: answers.length,
      accuracy,
      minutes,
    });

    // 薄弱项：答错或需要多次尝试的题，按词累计
    for (const a of answers) {
      if (a.correct && a.attempts <= 1) continue;
      const q = unit?.questions.find((x) => x.id === a.questionId);
      if (!q) continue;
      const word = q.audioText;
      const meta = WORD_META[word];
      const prev = wrongByWord.get(word);
      wrongByWord.set(word, {
        count: (prev?.count ?? 0) + 1,
        noteZh: meta
          ? `${meta.meaningZh}（${meta.phonetic}）需要多练几次`
          : '这个词需要多练几次',
      });
    }
  }

  const weakSounds = [...wrongByWord.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([word, v]) => ({ sound: word, noteZh: v.noteZh }));

  // 连续天数：从本周最后一天往前数有学习记录的天数
  let streak = 0;
  for (let i = dailyMinutes.length - 1; i >= 0; i--) {
    if (dailyMinutes[i].minutes > 0) streak++;
    else if (i < dailyMinutes.length - 1) break;
  }

  const unitMastery = [...doneUnits].map((uid) => {
    const unit = SERVER_UNITS.find((u) => u.unitId === uid);
    const unitSessions = sessions.filter((s) => s.unitId === uid);
    const all = unitSessions.flatMap((s) => safeParse<AnswerDetail[]>(s.answersJson, []));
    const firstTry = all.filter((a) => a.correct && a.attempts === 1).length;
    const percent = all.length ? Math.round((firstTry / all.length) * 100) : 0;
    return { unit: unit?.titleZh ?? uid, percent };
  });

  const report = {
    weekLabel: label,
    minutes: Math.round(totalMs / 60000),
    unitsDone: doneUnits.size,
    unitsTotal: SERVER_UNITS.length,
    streakDays: streak,
    dailyMinutes,
    weakSounds,
    unitMastery,
  };

  return NextResponse.json({ report, rows });
}

function safeParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
