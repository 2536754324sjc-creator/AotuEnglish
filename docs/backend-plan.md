# AotuEnglish 后端框架设计

> 状态：v0.1 · 2026-10-21
> 范围：`web/` 工程的后端层。不涉及 `ui-skills/`（独立项目）。
> 前端页面规划见 [`frontend-plan.md`](./frontend-plan.md)。

---

## 1. 现状与边界

`web/` 目前是纯前端：所有页面直接从 [`mock-data.ts`](../web/src/lib/mock-data.ts) 读数据，
答题结果只存在于组件状态里，刷新即丢。

后端要补的是三件事：

1. **内容只读接口** —— 课程、单元、题目，数据来自 Dify 产出 + 审核落库。
2. **学习进度写入** —— 一次练习结束后上报作答，服务端计分并推进关卡。
3. **周报聚合** —— 从练习记录算出时长、完成度、薄弱项。

明确不做（至少不在 P0）：支付、邮件、TTS、图片生成、Dify 实时调用。

---

## 2. 架构决策

| # | 决策 | 理由 |
| --- | --- | --- |
| 1 | 后端放在**同一个 Next.js 应用**的 `src/app/api/**/route.ts`，不新起服务 | 文档 §5.1 的契约就是 `/api/*`；同源无 CORS；将来登录态用 cookie 可直接共享；只有一套部署 |
| 2 | 严格四层：`route → service → repository → store` | route 只管 HTTP，service 管业务规则，repository 管存取，store 可替换 |
| 3 | P0 用**内存仓储**，接口先定死，P1 换 SQL | 不引入数据库依赖就能跑通全部接口与测试；换库只改 repository 实现 |
| 4 | **内容与进度分离** | `Unit` 里的 `status` 是学习者进度，不是内容；同一单元对不同学习者状态不同。服务端拆成 `UnitContent` + `UnitProgress`，只在出口组装 |
| 5 | **服务端权威计分** | 客户端提交选项，服务端拿题库里的 `correct` 复算星星，不信任客户端传的星数 |
| 6 | 统一响应信封 + 稳定错误码 | 前端只写一套错误处理；测试可直接断言 code |
| 7 | 写接口**幂等** | `clientSessionId` 唯一，网络重试不会重复加星、重复推进关卡 |
| 8 | 时间口径固定 `Asia/Shanghai` | 周报按本地日切分，跨时区不漂移；时区做成配置 |

---

## 3. 目录结构

```
web/src/
  app/api/                       路由层（薄）
    health/route.ts
    courses/route.ts
    courses/[slug]/route.ts
    courses/[slug]/units/[unitId]/route.ts
    units/[unitId]/route.ts
    users/me/progress/route.ts
    users/me/sessions/route.ts
    reports/weekly/route.ts
  server/                        后端层（只在服务端执行）
    config.ts                    数据模式、默认学习者、时区
    http/api.ts                  响应信封、ApiError、route() 包装、参数解析
    domain/
      types.ts                   服务端实体（内容 / 进度 / 练习记录）
      rules.ts                   计分、关卡状态、宝箱、连续天数
      time.ts                    ISO 周、本地日、周区间、标签
    repositories/
      types.ts                   Repository 接口（唯一存取契约）
      memory.ts                  内存实现
      index.ts                   单例 + 数据源选择
    seed/seed.ts                 用现有 mock 数据灌初始数据
    services/
      course-service.ts
      progress-service.ts
      session-service.ts
      report-service.ts
web/tests/
  backend.test.ts                接口与规则测试（node:test）
```

依赖方向单向：

```
route → service → repository → (memory | sql)
              ↘ domain（纯函数，无 IO）
```

`domain/` 不 import 任何 repository / route；`repository/` 不 import service。

---

## 4. 数据模型

P0 内存实现照下面的形状建；P1 落库时一一对应成表。

### 4.1 内容侧

| 实体 | 关键字段 |
| --- | --- |
| `CourseRecord` | `slug`、`titleZh`、`titleEn`、`level`、`domain`、`unitCount`（规划总数）、`publishedUnitCount`（实际已发布） |
| `UnitContent` | `unitId`、`index`、`level`、`topic`、`titleZh`、`wordCount`、`estMinutes`、`questions[]`、`reviewed` |
| `Question` | `id`、`type`、`promptZh`、`audioText`、`options[]` |
| `Option` | `id`、`text?`、`imagePrompt?`、`imageUrl?`、`correct` |
| `courseUnits` | 课程与单元的多对多关联（`courseSlug` + `unitId`） |

`UnitContent` **没有** `status`；`index` 是课程内顺序。

### 4.2 学习者侧

| 实体 | 关键字段 |
| --- | --- |
| `LearnerRecord` | `id`、`name`、`level`、`starsGoal`、`starsBase`、`createdAt` |
| `UnitProgressRecord` | `learnerId`、`unitId`、`stars`、`attempts`、`completedAt` |
| `PracticeSessionRecord` | `id`、`learnerId`、`unitId`、`clientSessionId`、`stars`、`totalQuestions`、`correctFirstTry`、`durationMs`、`startedAt`、`finishedAt`、`answers[]` |
| `SessionAnswerRecord` | `questionId`、`selectedOptionId`、`correct`、`attempts` |
| `WeakSoundRecord` | `learnerId`、`sound`、`noteZh` |

派生值（不落库，查询时算）：

- `Unit.status` = `done` / `current` / `locked`
- `TodayProgress.starTotal` = `starsBase` + Σ 已完成单元的星数
- `TodayProgress.starsToday` = 今天完成单元所得的星数
- `WeeklyReport` 全部字段

### 4.3 P1 建表对照

```
learner(id, name, level, stars_goal, stars_base, created_at)
course(slug, title_zh, title_en, level, domain, unit_count)
course_unit(course_slug, unit_id, ordinal)
unit(unit_id, level, topic, title_zh, word_count, est_minutes, reviewed, published_at)
question(id, unit_id, ordinal, type, prompt_zh, audio_text)
question_option(id, question_id, ordinal, text, image_prompt, image_url, correct)
unit_progress(learner_id, unit_id, stars, attempts, completed_at)  PK(learner_id, unit_id)
practice_session(id, learner_id, unit_id, client_session_id, stars, total_questions,
                 correct_first_try, duration_ms, started_at, finished_at)
                 UNIQUE(learner_id, client_session_id)
practice_answer(session_id, question_id, selected_option_id, correct, attempts)
weak_sound(learner_id, sound, note_zh)
```

---

## 5. API 契约

沿用 [`frontend-plan.md`](./frontend-plan.md) §5.1，补充实现细节。
所有接口返回统一信封（见 §6）。P0 无鉴权，学习者由 `x-learner-id` 头指定，
缺省用 `learner-mia`；P2 换成登录态。

| 方法 | 路径 | 用途 | 主要参数 |
| --- | --- | --- | --- |
| GET | `/api/health` | 存活与数据模式 | — |
| GET | `/api/courses` | 课程列表 | `level?`、`domain?` |
| GET | `/api/courses/:slug` | 课程详情 + 单元摘要 | — |
| GET | `/api/courses/:slug/units/:unitId` | 单元完整题目（含该学习者状态） | — |
| GET | `/api/units/:unitId` | 同上，不校验课程归属 | — |
| GET | `/api/users/me/progress` | 今日任务、当前关、星星、宝箱 | — |
| POST | `/api/users/me/sessions` | 一次练习的作答批提交 | body 见下 |
| GET | `/api/reports/weekly` | 周报数据 | `week?=2026-W43` |

### 5.1 POST /api/users/me/sessions

```jsonc
{
  "unitId": "kids-a-numbers",
  "clientSessionId": "8f1c2d3e-...",   // 客户端生成，幂等键
  "durationMs": 183000,
  "startedAt": "2026-10-21T09:00:00.000Z",
  "answers": [
    { "questionId": "u3-q1", "selectedOptionId": "a", "attempts": 1 },
    { "questionId": "u3-q2", "selectedOptionId": "a", "attempts": 2 }
  ]
}
```

规则：

- `answers` 必须**覆盖该单元全部题目、且不重复**，否则 422。
- `attempts` ≥ 1；`correct` 由服务端按题库判，客户端传了也忽略。
- 重复 `clientSessionId` 返回已有结果，`deduplicated: true`，状态 200；首次 201。
- 返回 `{ session, progress, deduplicated }`，前端拿到 `progress` 可直接刷新地图。

### 5.2 GET /api/reports/weekly

`week` 用 ISO 周（`YYYY-Www`），缺省为当前周；格式不合法 400。
返回 `{ week, weekLabel, ...WeeklyReport, rows }`，其中：

- `dailyMinutes` 固定 7 项，无数据补 0（前端据此判断空态）。
- `rows` 每条练习一行，按日期升序。
- 零数据时所有数字为 0、数组为空，不返回空坐标轴所需的假数据。

---

## 6. 统一响应与错误码

```jsonc
// 成功
{ "ok": true, "data": { ... } }

// 失败
{ "ok": false, "error": { "code": "UNIT_NOT_FOUND", "message": "找不到这一关", "details": null } }
```

| code | HTTP | 场景 |
| --- | --- | --- |
| `BAD_REQUEST` | 400 | JSON 解析失败、参数格式错 |
| `UNAUTHORIZED` | 401 | P2 起：无登录态 |
| `FORBIDDEN` | 403 | P2 起：无权访问该学习者 |
| `NOT_FOUND` | 404 | 路由不存在 |
| `LEARNER_NOT_FOUND` | 404 | 学习者不存在 |
| `COURSE_NOT_FOUND` | 404 | 课程不存在 |
| `UNIT_NOT_FOUND` | 404 | 单元不存在 |
| `CONFLICT` | 409 | 幂等键冲突但内容不一致 |
| `UNPROCESSABLE` | 422 | 业务校验不通过（缺题、越界、题目不属于该单元） |
| `INTERNAL` | 500 | 未捕获异常，message 固定，不泄内部信息 |

所有响应带 `Cache-Control: no-store`（P0 全是用户态数据）。错误响应不返回堆栈。

---

## 7. 业务规则

### 7.1 星星

以**首次作答是否正确**为口径：

| 条件 | 星数 |
| --- | --- |
| 全部题目首次答对 | 3 |
| 首次答对比例 ≥ 70% | 2 |
| 其余（完成即得） | 1 |

重玩同一单元：`UnitProgress.stars` 取历史最大值，`starTotal` 不重复累加。

### 7.2 关卡状态

按 `index` 升序：

- 有进度记录 → `done`
- 第一个没有进度记录的单元 → `current`
- 其余 → `locked`

全部完成时没有 `current`，`currentUnitIndex` 取最后 index + 1。

### 7.3 宝箱

每完成 3 关一个宝箱：`chestRemaining = 3 - (doneCount % 3)`，取值 1–3。

### 7.4 周报口径

- 按 `Asia/Shanghai` 本地日切分，周一为一周起点（ISO 周）。
- `minutes` = 本周所有练习 `durationMs` 之和四舍五入到分钟。
- `unitsDone` = 本周完成的单元数；`unitsTotal` = 该学习者内容档下已发布单元总数。
- `streakDays` = 截至本周最后有练习的一天，向前连续有练习的天数。
- `unitMastery` = 按单元汇总 `correctFirstTry / totalQuestions`，降序。
- `weakSounds` P0 来自种子数据；P3 接真实发音评分后改为按题目标签聚合。

### 7.5 时区与日期

`domain/time.ts` 只处理 `YYYY-MM-DD` 字符串与 ISO 周键，不把本地时间塞进 `Date`
再比较。所有「今天」「本周」都由 `Intl.DateTimeFormat` 按配置时区算出。

---

## 8. 分阶段实施

| 阶段 | 内容 | 验收 |
| --- | --- | --- |
| **P0（本次）** | 四层骨架 + 8 个接口 + 内存仓储 + 种子数据 + 接口/规则测试 | `npm run typecheck` 0 错误；`npm test` 全绿；8 个接口返回契约形状 |
| **P1** | Repository 换 SQL（`node:sqlite` 或 D1，见 §10）+ 迁移脚本 + 启动时灌种子 | 同一套 service 测试在 SQL 实现下全绿 |
| **P2** | 账号与登录态、`learner` 归属校验、跨学习者隔离 | 无 cookie 访问 `/api/users/me/*` 返回 401 |
| **P3** | 内容入库与审核、Dify 异步任务、`imageUrl` 回填、发布门槛 `reviewed` | 未审核单元不出现在公开接口 |
| **P4** | 前端接入：`lib/api-client.ts` + 页面从 mock 切到接口 | 页面不再 import `mock-data`，行为与现在一致 |

P0 交付后前端**不需要改**，接口形状与现有 `types.ts` 对齐；P4 才动页面。

---

## 9. 测试策略

- 单元测试：`domain/rules.ts`、`domain/time.ts` 纯函数，覆盖边界（0 题、全错、跨周、跨年）。
- 服务测试：用独立内存仓储，覆盖计分、幂等、状态推进、周报空态。
- 路由测试：直接调用导出的 `GET`/`POST`，断言状态码、信封、错误码。
- 不引入测试框架：Node 内置 `node:test` + `tsx`（与 `ui-skills` 一致）。
- P1 换 SQL 后，服务测试保持不变，只换 repository 构造参数——这是分层的验收标准。

---

## 10. 待定项

| # | 问题 | 倾向 |
| --- | --- | --- |
| 1 | P1 存储选型 | `node:sqlite`（零依赖、单机） vs Cloudflare D1（与 `ui-skills` 一致、需 Workers 部署） vs Postgres（多实例）。取决于部署目标 |
| 2 | 登录方式 | 文档 §6 写的是手机号/邮箱 + 验证码；P2 前需要确认是否接第三方 |
| 3 | `Option.correct` 是否下发 | 现状下发，前端靠它判题。目标改为服务端判题 + 只下发选项，需要前端配套改 |

## 11. 已知技术债（P0 显式保留）

1. **答案随题目下发**：`GET` 单元接口仍返回 `correct`，与现有前端兼容；P4 改为服务端判题。
2. **无鉴权**：`x-learner-id` 可伪造，仅限开发环境；P2 必须替换。
3. **课程与单元是临时关联**：种子数据里把 kids-a 单元挂到两个 kids-a 课程下，仅用于跑通接口；P3 用真实 `course_unit` 数据替换。
4. **历史周报数据是种子**：P0 的练习记录由种子生成，用于验证聚合逻辑，不代表真实学习行为。
