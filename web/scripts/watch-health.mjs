#!/usr/bin/env node
/**
 * 本地可用性监控（不依赖任何第三方账号）
 *
 * 用法：
 *   node scripts/watch-health.mjs https://aotuenglish.vercel.app
 *   node scripts/watch-health.mjs https://aotuenglish.vercel.app --interval 300
 *
 * 行为：
 * - 每 N 秒（默认 300 = 5 分钟）打一次 /api/health
 * - 连续 2 次失败才告警（避免 Neon 冷启动导致的偶发超时误报）
 * - 告警方式：写日志文件 + 控制台输出；Windows 上可加 --beep 响铃
 * - 恢复时也输出一条，便于确认
 *
 * 为什么写这个：UptimeRobot 需要注册账号（邮箱验证），
 * 而"知道网站挂了"这件事不该被账号流程挡住。
 * 这个脚本可以挂在后台长期跑，也可以配合任务计划程序开机自启。
 *
 * 注意：它只在你本机运行。关机后就不监控了。
 * 要 7x24 监控仍需外部服务（见 docs/monitoring.md）。
 */

import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const url = args.find((a) => a.startsWith('http'));

if (!url) {
  console.error('用法: node scripts/watch-health.mjs https://your-domain [--interval 300] [--beep]');
  process.exit(2);
}

const intervalIdx = args.indexOf('--interval');
const intervalSec = intervalIdx >= 0 ? Number(args[intervalIdx + 1]) || 300 : 300;
const beep = args.includes('--beep');

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_DIR = join(__dirname, '..', '.monitor');
const LOG_FILE = join(LOG_DIR, 'health.log');

try {
  mkdirSync(LOG_DIR, { recursive: true });
} catch {
  /* 已存在 */
}

const healthUrl = url.replace(/\/$/, '') + '/api/health';

let consecutiveFailures = 0;
let lastState = 'unknown';
let checks = 0;

function log(line) {
  const ts = new Date().toISOString();
  const entry = `[${ts}] ${line}`;
  console.log(entry);
  try {
    appendFileSync(LOG_FILE, entry + '\n', 'utf8');
  } catch {
    /* 日志写不进去不影响监控本身 */
  }
}

async function check() {
  checks++;
  const started = Date.now();
  try {
    const body = await probe();
    const ms = Date.now() - started;

    if (body.ok === true) {
      consecutiveFailures = 0;
      // 只在状态变化时输出，避免刷屏
      if (lastState !== 'up') {
        log(`UP   ${healthUrl} (${ms}ms, db=${body.db})`);
        lastState = 'up';
      }
    } else {
      throw new Error(`body=${JSON.stringify(body).slice(0, 120)}`);
    }
  } catch (e) {
    consecutiveFailures++;
    const msg = e instanceof Error ? e.message : String(e);

    // 连续 2 次才告警：Neon 冷启动可能让单次请求超时，不应误报
    if (consecutiveFailures >= 2) {
      if (lastState !== 'down') {
        log(`DOWN ${healthUrl} — 连续 ${consecutiveFailures} 次失败: ${msg}`);
        lastState = 'down';
        if (beep) process.stdout.write('\x07');
      }
    } else {
      log(`warn 第 ${consecutiveFailures} 次失败（暂不告警，等下次确认）: ${msg}`);
    }
  }
}

/**
 * 探测健康检查，返回解析后的 JSON。
 *
 * 为什么优先用 PowerShell（Windows）：
 * 实测本机 Node 的 fetch / https 连该域名会 ETIMEDOUT（208.101.60.87:443），
 * 而 PowerShell 的 Invoke-RestMethod 能正常返回 200。
 * 这是本机网络环境对 Node 的限制，不是站点问题。
 * 所以 Windows 上用 PowerShell 探测，其它平台用 fetch。
 */
async function probe() {
  if (process.platform === 'win32') {
    const { execFileSync } = await import('node:child_process');
    const ps = `
      $ProgressPreference='SilentlyContinue';
      try {
        $r = Invoke-RestMethod -Uri '${healthUrl}' -TimeoutSec 30 -ErrorAction Stop;
        $r | ConvertTo-Json -Compress
      } catch {
        Write-Output ('__ERR__' + $_.Exception.Message)
      }
    `;
    const out = execFileSync(
      'powershell',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps],
      { encoding: 'utf8', timeout: 60000 },
    ).trim();

    if (out.startsWith('__ERR__')) throw new Error(out.slice(7));
    return JSON.parse(out);
  }

  const res = await fetch(healthUrl, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`status=${res.status}`);
  return res.json();
}

log(`开始监控 ${healthUrl}，间隔 ${intervalSec} 秒，日志 ${LOG_FILE}`);
log('提示：本机监控在关机后停止；7x24 监控请用外部服务（见 docs/monitoring.md）');

await check();
setInterval(check, intervalSec * 1000);
