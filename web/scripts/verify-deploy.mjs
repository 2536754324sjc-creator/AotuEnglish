#!/usr/bin/env node
/**
 * 部署后一键验证（上线后跑这个，不用临时拼命令）
 *
 * 用法：
 *   node scripts/verify-deploy.mjs https://your-app.vercel.app
 *
 * 检查项（按"出问题时最难查"排序）：
 * 1. 健康检查：数据库连得上、且连的是 postgresql 而不是 sqlite
 * 2. 注册：能建号、拿到 token
 * 3. 登录：密码校验正确、错误密码被拒
 * 4. 单元：能取到题目，且**不下发答案**
 * 5. 作答：提交后拿到服务端裁定的星级
 * 6. 进度：数据真的落库（重新读取能看到）
 * 7. 隔离：另一个账号看不到上一个账号的数据
 *
 * 为什么这些项：它们覆盖了"上线后最常见的 7 种坏法"，
 * 每一项失败都对应一个明确的排查方向。
 */

const base = (process.argv[2] || '').replace(/\/$/, '');

if (!base) {
  console.error('用法: node scripts/verify-deploy.mjs https://your-app.vercel.app');
  process.exit(2);
}

let pass = 0;
let fail = 0;
const results = [];

function ok(name, cond, detail = '') {
  if (cond) {
    pass++;
    console.log(`PASS  ${name}${detail ? '  -> ' + detail : ''}`);
  } else {
    fail++;
    console.log(`FAIL  ${name}${detail ? '  -> ' + detail : ''}`);
    results.push({ name, detail });
  }
}

async function call(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* 非 JSON 响应 */
  }
  return { status: res.status, json };
}

const stamp = Date.now();
const emailA = `verify-a-${stamp}@example.com`;
const emailB = `verify-b-${stamp}@example.com`;

// 单元正确答案（与服务端 lib/server/units.ts 保持一致）
const CORRECT = {
  'u0-q1': 'a', 'u0-q2': 'a', 'u0-q3': 'b', 'u0-q4': 'a', 'u0-q5': 'b', 'u0-q6': 'a',
};

async function main() {
  console.log(`验证目标: ${base}\n`);

  /* ---------- 1. 健康检查 ---------- */
  const health = await call('/api/health');
  ok('健康检查返回 200', health.status === 200, `status=${health.status}`);
  ok(
    '健康检查 ok=true',
    health.json?.ok === true,
    JSON.stringify(health.json),
  );
  ok(
    '连的是 PostgreSQL（不是 sqlite）',
    health.json?.db === 'postgresql',
    `db=${health.json?.db}  ← 若为 sqlite，说明 DATABASE_URL 没生效，数据会丢`,
  );

  /* ---------- 2. 注册 ---------- */
  const signup = await call('/api/auth/login', {
    method: 'POST',
    body: { email: emailA, password: 'password123', mode: 'signup' },
  });
  ok('注册成功', signup.status === 200 && Boolean(signup.json?.token), `status=${signup.status}`);
  const tokenA = signup.json?.token;

  /* ---------- 3. 登录 ---------- */
  const wrongPw = await call('/api/auth/login', {
    method: 'POST',
    body: { email: emailA, password: 'wrong-password', mode: 'login' },
  });
  ok('错误密码被拒（401）', wrongPw.status === 401, `status=${wrongPw.status}`);

  const login = await call('/api/auth/login', {
    method: 'POST',
    body: { email: emailA, password: 'password123', mode: 'login' },
  });
  ok('正确密码可登录', login.status === 200 && Boolean(login.json?.token), `status=${login.status}`);

  /* ---------- 4. 单元不下发答案 ---------- */
  const unit = await call('/api/units/kids-a-greetings', { token: tokenA });
  ok('单元可取到', unit.status === 200 && unit.json?.unit?.questions?.length > 0, `status=${unit.status}`);
  ok(
    '单元不下发正确答案（防 F12 看答案）',
    !/"correct":\s*true/.test(JSON.stringify(unit.json)),
    '若失败：服务端判分被破坏，学生可直接看答案',
  );

  /* ---------- 5. 作答 ---------- */
  const qs = unit.json?.unit?.questions ?? [];
  const answers = qs.map((q) => ({
    questionId: q.id,
    optionId: CORRECT[q.id] ?? q.options[0].id,
    attempts: 1,
    elapsedMs: 3000,
  }));

  const submit = await call('/api/users/me/sessions', {
    method: 'POST',
    token: tokenA,
    body: {
      unitId: 'kids-a-greetings',
      startedAt: new Date(Date.now() - 120000).toISOString(),
      finishedAt: new Date().toISOString(),
      answers,
    },
  });
  ok('作答提交成功', submit.status === 200, `status=${submit.status}`);
  ok(
    '服务端裁定星级（全对一次答对应为 3）',
    submit.json?.stars === 3,
    `stars=${submit.json?.stars}`,
  );

  /* ---------- 6. 数据真的落库 ---------- */
  const progress = await call('/api/users/me/progress', { token: tokenA });
  ok('进度可重新读取', progress.status === 200, `status=${progress.status}`);
  ok(
    '完成状态已落库',
    progress.json?.units?.some((u) => u.unitId === 'kids-a-greetings' && u.status === 'done'),
    '若失败：数据没写进数据库（可能仍连 SQLite 临时文件）',
  );
  ok(
    '星星总数已累计',
    (progress.json?.starTotal ?? 0) >= 3,
    `starTotal=${progress.json?.starTotal}`,
  );

  const words = await call('/api/users/me/words', { token: tokenA });
  ok(
    '词卡随单元解锁',
    (words.json?.collectedCount ?? 0) > 0,
    `collected=${words.json?.collectedCount}`,
  );

  const weekly = await call('/api/reports/weekly', { token: tokenA });
  ok('周报有真实数据', (weekly.json?.report?.minutes ?? 0) > 0, `minutes=${weekly.json?.report?.minutes}`);

  /* ---------- 7. 跨用户隔离 ---------- */
  const signupB = await call('/api/auth/login', {
    method: 'POST',
    body: { email: emailB, password: 'password123', mode: 'signup' },
  });
  const tokenB = signupB.json?.token;
  const progressB = await call('/api/users/me/progress', { token: tokenB });
  ok(
    '新用户看不到别人的数据',
    progressB.json?.starTotal === 0 &&
      progressB.json?.units?.every((u) => u.status !== 'done'),
    `starTotal=${progressB.json?.starTotal}（应为 0）`,
  );

  /* ---------- 汇总 ---------- */
  console.log(`\n${'='.repeat(46)}`);
  console.log(`${pass}/${pass + fail} 通过`);

  if (fail > 0) {
    console.log('\n失败项与排查方向：');
    for (const r of results) {
      console.log(`  - ${r.name}`);
      if (r.detail) console.log(`    ${r.detail}`);
    }
    console.log('\n常见原因：');
    console.log('  · db 显示 sqlite  -> Vercel 环境变量 DATABASE_URL 没加到 Production');
    console.log('  · 注册 500        -> 数据库表没建，执行 npx prisma migrate deploy');
    console.log('  · 进度为 0        -> 数据没落库，同上；或 NEXT_PUBLIC_API_MODE 不是 live');
    console.log('  · 单元带答案      -> 部署的代码不是最新版本');
  }

  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('\n验证脚本异常：', e.message);
  console.error('若为 ENOTFOUND / ECONNREFUSED，先确认域名可访问');
  process.exit(2);
});
