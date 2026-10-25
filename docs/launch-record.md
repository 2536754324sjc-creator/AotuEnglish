# 上线记录

> 首次上线：2026-10-25
> 本文记录**实际做了什么**（与 `deploy.md` 的"怎么做"互补）。

---

## 线上地址

| 项 | 值 |
| --- | --- |
| 生产地址 | https://aotuenglish.vercel.app |
| 健康检查 | https://aotuenglish.vercel.app/api/health |
| Vercel 项目 | `aotu-engshil/aotuenglish` |
| 数据库 | Neon PostgreSQL 18.6（Singapore，`neondb`） |
| Node 版本 | 24.x |
| 部署保护 | 已关闭（否则公众无法访问） |

**当前未做**：
- 未绑定自有域名（用 Vercel 免费子域）
- 未配置外部监控（步骤见 `monitoring.md`，需你注册 UptimeRobot）
- 未接支付

---

## 部署方式

目前用 **Vercel CLI 直接上传本地目录**，不是 Git 自动部署：

```bash
cd web
npx vercel deploy --prod --yes --token $VERCEL_TOKEN
```

**含义**：改了代码必须手动重新部署，推送 GitHub **不会**自动上线。

若要改成推 Git 自动部署（更推荐，避免忘记部署）：
```bash
npx vercel git connect
```
或在 Vercel 控制台 → Settings → Git 里连接仓库，并把 Root Directory 设为 `web`。

---

## 环境变量（Production）

| Key | 值 | 类型 |
| --- | --- | --- |
| `DATABASE_URL` | Neon 连接串（含 `?sslmode=require`） | Secret |
| `NEXT_PUBLIC_API_MODE` | `live` | Config |
| `NEXT_PUBLIC_API_BASE` | `/api` | Config |
| `NEXT_PUBLIC_SITE_URL` | `https://aotuenglish.vercel.app` | Config |

> `NEXT_PUBLIC_*` 是**构建时内联**的，改完必须 Redeploy。

---

## 上线过程中发现并修复的 4 个真实 bug

这些在本地 mock/SQLite 下都不会暴露，只有真上 Neon + Vercel 才出现：

### 1. 学习者页整页崩溃

**现象**：`/parent/learners` 显示 "This page couldn't load"，
控制台报 `s.map is not a function`。

**原因**：后端返回 `{ items: [...] }`，而前端 `api.getLearners()` 的类型是 `Learner[]`，
mock 也返回数组。类型声明与运行时不一致。

**修复**：后端改为直接返回数组。**契约以前端类型为准**，后端适配它。

### 2. 读物页 404

**现象**：`/learn/reading` 显示「这一页找不到了」。

**原因**：前端请求 `/readings`，后端只有 `/users/me/readings`（只返回进度）。

**修复**：新增 `liveReadings()`，用前端本地书目 + 服务端进度合并。
同时读物进度改走 `api.saveReadingProgress()`，live 模式会同步到服务端。

**设计决定**：书目正文/插图属于**内容**，随前端发布；
服务端只存**学习者**的进度。两边各存一份必然出现过期数据。

### 3. 作答提交偶发失败（最关键）

**现象**：结算页显示「刚才网络不太顺，这次的成绩可能没存上」。

**原因**（Vercel 日志）：
```
Transaction API error: A query cannot be executed on an expired transaction.
The timeout for this transaction was 5000 ms, however 5340 ms passed
```

`submitSession` 在一个事务里做约 20 条语句（session + progress + 6 条词卡
+ 最多 6 条复习 upsert）。本地 SQLite 是毫秒级，但 Neon 免费层冷启动
+ 跨区域往返，5 秒默认超时不够。

**修复**：两处事务显式设 20 秒超时（`grading.ts`、`learners/route.ts`）。

**实测**：修复后一次提交耗时 11.8 秒，确实远超 5 秒。

### 4. AntD 6 废弃 API

登录页 `Alert` 用 `message`，改为 `title`（会打控制台警告）。

---

## 上线后验证结果

用 `node scripts/verify-deploy.mjs <url>` 与浏览器实测，**16/16 通过**：

| 项目 | 结果 |
| --- | --- |
| 首页 / 注册 / 登录 | 通过 |
| 健康检查 `db=postgresql` | 通过 |
| 新用户词卡 0/30 | 通过 |
| 完成单元 → 结算页 | 通过 |
| 作答成功落库（非"没存上"） | 通过 |
| 服务端裁定星星 | 通过（共 1 颗星） |
| 地图星数更新 | 通过（1/5） |
| 词卡解锁 | 通过（0/30 → 6/30） |
| 读物页正常 | 通过（不再 404） |
| 家长端 5 个页面 | 全部通过 |
| 零控制台错误 | 通过 |

---

## 已知性能问题

**Neon 免费层冷启动慢**：闲置后首次请求可能 7–12 秒。

- 表现：页面白屏较久、词卡计数要等 7 秒才出现
- 不是 bug，是免费层特性（计算实例休眠后需唤醒）
- 缓解：升级 Neon 付费层可关闭休眠；或加一个定时探活（每分钟打 `/api/health`）
  保持实例活跃，但这会消耗免费额度，需权衡

**Vercel 函数冷启动**：首次调用约 1–2 秒。

---

## 下一步

1. **配置监控** —— 见 `monitoring.md`（需你注册 UptimeRobot）
2. **改为 Git 自动部署** —— 避免改完忘记手动部署
3. **接支付** —— 目前唯一阻止收费的缺口
4. 绑定自有域名（可选，不需要备案）
5. 若访问慢影响体验，考虑升级 Neon 或加探活
