import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  chestRemaining,
  resolveUnitStatuses,
  scoreSubmission,
  starsFor,
} from '../src/server/domain/rules';
import {
  addDays,
  consecutiveDays,
  isoWeekKey,
  localDateKey,
  weekDayKeys,
} from '../src/server/domain/time';
import { ApiError } from '../src/server/http/api';
import { createMemoryRepository } from '../src/server/repositories/memory';
import { setRepository } from '../src/server/repositories';
import { buildSeedData } from '../src/server/seed/seed';
import { getCourseDetail, getCourseUnit, getUnitPayload, listCourses } from '../src/server/services/course-service';
import { getTodayProgress } from '../src/server/services/progress-service';
import { getWeeklyReport } from '../src/server/services/report-service';
import { submitSession } from '../src/server/services/session-service';
import { GET as getProgressRoute } from '../src/app/api/users/me/progress/route';
import { GET as getUnitRoute } from '../src/app/api/units/[unitId]/route';
import { POST as postSessionRoute } from '../src/app/api/users/me/sessions/route';
import type { Question } from '../src/lib/types';

/** 上海时间 2026-10-21 12:00，周三，ISO 周 2026-W43 */
const NOW = new Date('2026-10-21T04:00:00.000Z');

function setup() {
  return createMemoryRepository(buildSeedData(NOW));
}

function correctAnswers(questions: Question[], attempts = 1) {
  return questions.map((question) => ({
    questionId: question.id,
    selectedOptionId: question.options.find((option) => option.correct)?.id ?? '',
    attempts,
  }));
}

test('日期工具按 ISO 周切分，且周键可往返', () => {
  const days = weekDayKeys('2026-W43');
  assert.ok(days);
  assert.equal(days.length, 7);
  assert.equal(days[0], '2026-10-19');
  assert.equal(days[6], '2026-10-25');
  assert.equal(isoWeekKey(days[0]), '2026-W43');
  assert.equal(isoWeekKey('2026-10-25'), '2026-W43');

  assert.equal(weekDayKeys('2026-W99'), null);
  assert.equal(addDays('2026-10-19', -2), '2026-10-17');
});

test('本地日按配置时区切分，不按 UTC', () => {
  assert.equal(localDateKey(new Date('2026-10-21T16:30:00.000Z'), 'Asia/Shanghai'), '2026-10-22');
  assert.equal(localDateKey(new Date('2026-10-21T15:59:00.000Z'), 'Asia/Shanghai'), '2026-10-21');
});

test('连续天数只数最后一段连续活跃日', () => {
  const days = weekDayKeys('2026-W43');
  assert.ok(days);
  assert.equal(consecutiveDays(days, new Set(['2026-10-19', '2026-10-20', '2026-10-21'])), 3);
  assert.equal(consecutiveDays(days, new Set(['2026-10-19', '2026-10-21'])), 1);
  assert.equal(consecutiveDays(days, new Set()), 0);
});

test('星星口径：全对 3，首次答对 ≥70% 2，其余 1', () => {
  assert.equal(starsFor(6, 6), 3);
  assert.equal(starsFor(5, 6), 2);
  assert.equal(starsFor(7, 10), 2);
  assert.equal(starsFor(4, 6), 1);
  assert.equal(starsFor(0, 6), 1);
});

test('服务端计分忽略客户端传的 correct，只看题库', async () => {
  const repo = setup();
  const unit = await repo.findUnit('kids-a-numbers');
  assert.ok(unit);

  const allFirstTry = scoreSubmission(unit.questions, correctAnswers(unit.questions));
  assert.equal(allFirstTry.stars, 3);
  assert.equal(allFirstTry.correctFirstTry, unit.questions.length);

  const retryAnswers = correctAnswers(unit.questions, 2);
  const retried = scoreSubmission(unit.questions, retryAnswers);
  assert.equal(retried.stars, 1);
  assert.equal(retried.accuracy, 100);
});

test('关卡状态：已完成 → 当前 → 锁定', async () => {
  const repo = setup();
  const units = await repo.listUnits({ level: 'kids-a' });
  const progress = await repo.listProgress('learner-mia');
  const statuses = resolveUnitStatuses(units, progress);

  assert.deepEqual(
    units.map((unit) => statuses.get(unit.unitId)),
    ['done', 'done', 'done', 'current', 'locked'],
  );
  assert.equal(chestRemaining(3, 3), 3);
  assert.equal(chestRemaining(4, 3), 2);
});

test('今日进度与前端 TodayProgress 形状一致', async () => {
  const repo = setup();
  const progress = await getTodayProgress('learner-mia', repo, NOW);

  assert.equal(progress.learnerName, 'Mia');
  assert.equal(progress.level, 'kids-a');
  assert.equal(progress.units.length, 5);
  assert.equal(progress.currentUnitIndex, 4);
  assert.equal(progress.starTotal, 128);
  assert.equal(progress.starsToday, 3);
  assert.equal(progress.starsGoal, 5);
  assert.equal(progress.chestRemaining, 3);
  assert.equal(progress.units[3].status, 'current');
});

test('课程列表支持内容档与领域筛选', async () => {
  const repo = setup();
  const all = await listCourses({}, repo);
  const kidsA = await listCourses({ level: 'kids-a' }, repo);
  const business = await listCourses({ domain: 'business' }, repo);
  const empty = await listCourses({ level: 'kids-a', domain: 'business' }, repo);

  assert.equal(all.courses.length, 4);
  assert.equal(kidsA.courses.length, 2);
  assert.equal(business.courses.length, 1);
  assert.equal(empty.courses.length, 0);

  const phonics = all.courses.find((course) => course.slug === 'phonics-starter');
  assert.equal(phonics?.publishedUnitCount, 5);

  await assert.rejects(
    listCourses({ level: 'unknown' }, repo),
    (error: unknown) => error instanceof ApiError && error.code === 'BAD_REQUEST',
  );
});

test('课程详情返回单元摘要，不泄露学习者状态', async () => {
  const repo = setup();
  const detail = await getCourseDetail('phonics-starter', repo);

  assert.equal(detail.course.slug, 'phonics-starter');
  assert.equal(detail.units.length, 5);
  assert.equal(detail.units[0].unitId, 'kids-a-greetings');
  assert.equal(detail.units[0].questionCount > 0, true);
  assert.equal('status' in detail.units[0], false);

  await assert.rejects(
    getCourseDetail('missing-course', repo),
    (error: unknown) => error instanceof ApiError && error.code === 'COURSE_NOT_FOUND',
  );
});

test('单元详情按学习者解析状态，并校验课程归属', async () => {
  const repo = setup();
  const payload = await getUnitPayload('kids-a-numbers', 'learner-mia', repo);
  assert.equal(payload.unit.status, 'current');
  assert.ok(payload.unit.questions.length > 0);

  const teen = await getUnitPayload('teen-school-01', 'learner-mia', repo);
  assert.equal(teen.unit.status, 'locked');

  await assert.rejects(
    getCourseUnit('phonics-starter', 'does-not-exist', 'learner-mia', repo),
    (error: unknown) => error instanceof ApiError && error.code === 'UNIT_NOT_FOUND',
  );

  await assert.rejects(
    getUnitPayload('does-not-exist', 'learner-mia', repo),
    (error: unknown) => error instanceof ApiError && error.code === 'UNIT_NOT_FOUND',
  );
});

test('提交练习：计分、推进关卡、幂等重试不重复加星', async () => {
  const repo = setup();
  const unit = await repo.findUnit('kids-a-numbers');
  assert.ok(unit);

  const body = {
    unitId: unit.unitId,
    clientSessionId: 'test-session-1',
    durationMs: 120_000,
    answers: correctAnswers(unit.questions),
  };

  const first = await submitSession('learner-mia', body, repo, NOW);
  assert.equal(first.deduplicated, false);
  assert.equal(first.session.stars, 3);
  assert.equal(first.session.accuracy, 100);
  assert.equal(first.progress.starTotal, 131);
  assert.equal(first.progress.starsToday, 6);
  assert.equal(first.progress.currentUnitIndex, 5);
  assert.equal(first.progress.chestRemaining, 2);

  const replay = await submitSession('learner-mia', body, repo, NOW);
  assert.equal(replay.deduplicated, true);
  assert.equal(replay.session.id, first.session.id);
  assert.equal(replay.progress.starTotal, 131);

  const sessions = await repo.listSessions('learner-mia');
  assert.equal(sessions.filter((item) => item.unitId === unit.unitId).length, 1);
});

test('提交练习：缺题、重复题、越界选项一律 422', async () => {
  const repo = setup();
  const unit = await repo.findUnit('kids-a-greetings');
  assert.ok(unit);

  const base = {
    unitId: unit.unitId,
    clientSessionId: 'test-session-invalid',
    durationMs: 60_000,
  };

  await assert.rejects(
    submitSession(
      'learner-mia',
      { ...base, answers: correctAnswers(unit.questions).slice(0, 2) },
      repo,
      NOW,
    ),
    (error: unknown) => error instanceof ApiError && error.code === 'UNPROCESSABLE',
  );

  const duplicated = correctAnswers(unit.questions);
  duplicated[1] = duplicated[0];
  await assert.rejects(
    submitSession('learner-mia', { ...base, answers: duplicated }, repo, NOW),
    (error: unknown) => error instanceof ApiError && error.code === 'UNPROCESSABLE',
  );

  const badOption = correctAnswers(unit.questions);
  badOption[0] = { ...badOption[0], selectedOptionId: 'z' };
  await assert.rejects(
    submitSession('learner-mia', { ...base, answers: badOption }, repo, NOW),
    (error: unknown) => error instanceof ApiError && error.code === 'UNPROCESSABLE',
  );

  await assert.rejects(
    submitSession('learner-mia', { ...base, clientSessionId: '' }, repo, NOW),
    (error: unknown) => error instanceof ApiError && error.code === 'BAD_REQUEST',
  );
});

test('周报：7 天补零、明细按日期、掌握度从练习现算', async () => {
  const repo = setup();
  const report = await getWeeklyReport('learner-mia', '2026-W43', repo, NOW);

  assert.equal(report.week, '2026-W43');
  assert.equal(report.weekLabel, '10/19–10/25');
  assert.deepEqual(
    report.dailyMinutes.map((item) => item.day),
    ['一', '二', '三', '四', '五', '六', '日'],
  );
  assert.deepEqual(
    report.dailyMinutes.map((item) => item.minutes),
    [12, 16, 9, 0, 0, 0, 0],
  );
  assert.equal(report.minutes, 37);
  assert.equal(report.rows.length, 3);
  assert.equal(report.rows[0].accuracy, 100);
  assert.equal(report.rows[1].accuracy, 83);
  assert.equal(report.streakDays, 3);
  assert.equal(report.unitsDone, 3);
  assert.equal(report.unitsTotal, 5);
  assert.equal(report.weakSounds.length, 2);
  assert.ok(report.unitMastery.length > 0);
});

test('周报：空周返回零值与空数组，供前端渲染空态', async () => {
  const repo = setup();
  const report = await getWeeklyReport('learner-mia', '2026-W40', repo, NOW);

  assert.equal(report.minutes, 0);
  assert.equal(report.unitsDone, 0);
  assert.equal(report.streakDays, 0);
  assert.equal(report.rows.length, 0);
  assert.equal(report.unitMastery.length, 0);
  assert.equal(report.dailyMinutes.length, 7);
  assert.ok(report.dailyMinutes.every((item) => item.minutes === 0));

  await assert.rejects(
    getWeeklyReport('learner-mia', '2026-W99', repo, NOW),
    (error: unknown) => error instanceof ApiError && error.code === 'BAD_REQUEST',
  );
  await assert.rejects(
    getWeeklyReport('learner-mia', '2026-43', repo, NOW),
    (error: unknown) => error instanceof ApiError && error.code === 'BAD_REQUEST',
  );
});

test('路由层：统一信封、404 错误码、POST 首次 201 重试 200', async () => {
  const repo = setup();
  setRepository(repo);

  try {
    const progressResponse = await getProgressRoute(
      new Request('http://localhost/api/users/me/progress'),
      { params: Promise.resolve({}) },
    );
    assert.equal(progressResponse.status, 200);
    assert.equal(progressResponse.headers.get('cache-control'), 'no-store');
    const progressBody = (await progressResponse.json()) as {
      ok: boolean;
      data: { learnerName: string };
    };
    assert.equal(progressBody.ok, true);
    assert.equal(progressBody.data.learnerName, 'Mia');

    const missingResponse = await getUnitRoute(
      new Request('http://localhost/api/units/nope'),
      { params: Promise.resolve({ unitId: 'nope' }) },
    );
    assert.equal(missingResponse.status, 404);
    const missingBody = (await missingResponse.json()) as {
      ok: boolean;
      error: { code: string };
    };
    assert.equal(missingBody.ok, false);
    assert.equal(missingBody.error.code, 'UNIT_NOT_FOUND');

    const unit = await repo.findUnit('kids-a-colors');
    assert.ok(unit);
    const body = {
      unitId: unit.unitId,
      clientSessionId: 'route-session-1',
      durationMs: 90_000,
      answers: correctAnswers(unit.questions),
    };

    const created = await postSessionRoute(
      new Request('http://localhost/api/users/me/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
      { params: Promise.resolve({}) },
    );
    assert.equal(created.status, 201);

    const retried = await postSessionRoute(
      new Request('http://localhost/api/users/me/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
      { params: Promise.resolve({}) },
    );
    assert.equal(retried.status, 200);
    const retriedBody = (await retried.json()) as { data: { deduplicated: boolean } };
    assert.equal(retriedBody.data.deduplicated, true);
  } finally {
    setRepository(null);
  }
});
