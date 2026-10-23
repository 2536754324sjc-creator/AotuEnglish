# API 契约

> 状态：**待评审** · 最后更新 2026-10-24
> 读者：后端开发、前端开发
> 关联：`docs/frontend-plan.md` §5.1（初稿）、`web/src/lib/types.ts`（现有类型）

---

## 0. 这份文档解决什么

`docs/frontend-plan.md` §5.1 给了一张「前端需要哪些接口」的表，但只到路由粒度，
没有定义**响应体的具体形状**。后端照那张表去做，前端仍然要重写一遍解析逻辑。

本文档把**三份 mock 数据的真实类型**（`mock-data.ts` / `mock-words.ts` / `mock-readings.ts`
/ `mock-review.ts` / `mock-rewards.ts`）逐字段映射成 HTTP 契约，
目标是实现 `HANDOFF.md` 里那句承诺：

> 替换 `mock-data.ts` 为真实请求时，**页面与组件一行不用改**。

---

## 1. 通用约定

| 项目 | 约定 |
| --- | --- |
| Base URL | `/api` |
| 版本 | 路径不带版本号；破坏性变更靠 `docs/` 变更记录 + 灰度 |
| 认证 | `Authorization: Bearer <token>`，token 由 `POST /api/auth/login` 换取 |
| 语言 | 响应固定返回 `titleZh` + `titleEn` 等双语字段，前端按 `level` 选，不做内容协商 |
| 时间 | ISO 8601 UTC，如 `2026-10-24T08:30:00Z` |
| 分页 | 列表统一 `{ items, total, page, pageSize }`，默认 `pageSize=20`，上限 100 |
| 缓存 | 内容类接口 `Cache-Control: public, max-age=300`；进度类 `no-store` |

### 1.1 错误格式

所有非 2xx 响应统一：

```json
{
  "error": {
    "code": "UNIT_NOT_FOUND",
    "message": "单元不存在",
    "requestId": "req_01HX..."
  }
}
```

| HTTP | `code` | 场景 |
| --- | --- | --- |
| 400 | `INVALID_PARAM` | 参数缺失/类型错 |
| 401 | `UNAUTHORIZED` | 无 token 或过期 |
| 403 | `FORBIDDEN` | 有 token 但不是本人/监护人 |
| 404 | `NOT_FOUND` | 资源不存在 |
| 409 | `SESSION_CONFLICT` | 同一单元重复提交 |
| 429 | `RATE_LIMITED` | 触发限流，带 `Retry-After` |
| 500 | `INTERNAL` | 服务端异常 |

### 1.2 客户端降级策略

前端**不因接口失败而白屏**。每个接口有明确降级：

| 接口 | 失败时前端行为 |
| --- | --- |
| 内容类（课程/单元/读物） | 显示上次缓存 + 「重试」按钮 |
| 进度类 | 顶部数字显示 `—`，不阻塞做题 |
| 上报类（作答/读完） | 本地队列重试 3 次，仍失败则静默丢弃并记日志 |

---

## 2. 接口总览

| # | 方法 | 路径 | 用途 | 对应页面 |
| --- | --- | --- | --- | --- |
| 1 | POST | `/auth/login` | 登录换 token | `/login` |
| 2 | GET | `/courses` | 课程列表 | `/courses`、`/` |
| 3 | GET | `/courses/:slug` | 课程详情 + 单元列表 | `/courses` |
| 4 | GET | `/units/:unitId` | 单元 + 全部题目 | `/learn/unit/[unitId]` |
| 5 | GET | `/users/me/progress` | 今日任务、当前关、星星、地图 | `/learn`、`/trial` |
| 6 | POST | `/users/me/sessions` | 作答批次上报 | `/learn/unit/[unitId]/done` |
| 7 | GET | `/users/me/words` | 词卡（含收集状态） | `/learn/words` |
| 8 | GET | `/readings` | 读物书架 | `/learn/reading` |
| 9 | POST | `/users/me/readings/:id/progress` | 读本进度上报 | `/learn/reading` |
| 10 | GET | `/users/me/review` | 到期复习项 | `/learn/review` |
| 11 | GET | `/users/me/rewards` | 徽章 + 宝箱 + 商店 | `/learn/rewards` |
| 12 | GET | `/reports/weekly` | 周报 | `/parent` |
| 13 | POST | `/admin/generate/units` | 触发 Dify 生成（仅后台） | 后台管理 |

> 与 §5.1 初稿的差异：
> - 初稿用 `/api/courses/:slug/units/:unitId`，本文档改成 **`/api/units/:unitId`**。
>   `unitId` 已经是全局唯一的（`kids-a-numbers` 这种），没必要嵌在课程下；
>   而且 `/learn/unit/[unitId]` 路由本身就是扁平取 id，前端不用再知道 slug。
> - 初稿没有 review / rewards / words / readings 四个接口，但它们各对应一个已上线页面，必须补。

---

## 3. 核心类型

> 这些类型已经存在于 `web/src/lib/types.ts`，本节是其 HTTP 表示。
> 前端用 `src/lib/api.ts` 统一解析，页面只拿这几类对象。

### 3.1 Level

```
'kids-a' | 'kids-b' | 'teen' | 'adult'
```

### 3.2 Question

```jsonc
{
  "id": "q_01HX",
  "type": "listen_choose_image",
  "promptZh": "听一听，选出正确的图",
  "audioText": "cow",          // 送 TTS 的文本
  "options": [
    { "id": "a", "imageUrl": "https://cdn/.../cow.jpg", "imagePrompt": "...", "correct": true },
    { "id": "b", "imageUrl": "https://cdn/.../duck.jpg", "imagePrompt": "...", "correct": false }
  ]
}
```

`type` 枚举（前端按此分发组件）：

| `type` | 适用档 | 前端组件 | 当前状态 | `options` 数量 |
| --- | --- | --- | --- | --- |
| `listen_choose_image` | 全档 | `PictureChoice` | ✅ 已实现 | ≥ 2 |
| `tap_to_read` | 4–12 | `TapCard` | ✅ 已实现 | **恰好 1** |
| `read_choose` | 7–12 起 | `TextChoice` | ✅ 已实现 | ≥ 2 |
| `cloze` | 13–16 起 | `ClozeText` | 🚧 待实现 | ≥ 2 |
| `repeat_word` | 全档 | `SpeakCard` + `WaveCanvas` | 🚧 待实现 | **恰好 1** |
| `blend_sounds` | 4–12 | `BlendTiles` | 🚧 待实现 | ≥ 2 |
| `business_scenario` | 17+ | `DialogueCard` | 🚧 待实现 | ≥ 2 |

> **为什么 `tap_to_read` / `repeat_word` 只有 1 个选项**：这两类是「点开听/读一遍」的
> 单卡交互，不存在选择动作。要求它们 ≥2 个选项会逼前端造一个假选项。
> 校验清单据此按题型区分。

> ⚠️ **务必对齐**：`web/src/lib/dify-adapter.ts` 里的 `IMPLEMENTED_TYPES` 目前只有
> `listen_choose_image` 和 `tap_to_read` 两种，但实际页面也支持 `read_choose`。
> 后端只能下发上表标 ✅ 的题型；下发其它题型时前端会降级为占位提示（不崩，但用户看到的是空题）。

**关键字段说明**

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `imageUrl` | 选图题**建议填** | 最终图片地址。为空时前端用 `imagePrompt` 哈希生成几何占位图（按 prompt 取色 + 形状区分，不会白屏）。**mock 阶段全部为空是预期行为** |
| `imagePrompt` | 可选 | 生成图时用的提示词，**同时是占位图的取色依据**，建议保留 |
| `text` | 文字题必填 | 选项文字 |
| `correct` | 是 | 正确答案标记。**答案不要单独下发**（见 §9 安全） |

> ⚠️ `imageUrl` 为空不是错误：`Option.imageUrl` 正是「OU 产不出、要后端补」的三个字段之一
> （见 `docs/frontend-plan.md` §5.1.1）。后端补图之前的空值是正常的，
> 前端占位图是**有意设计**，不是凑合。

### 3.3 Unit

```jsonc
{
  "unitId": "kids-a-numbers",
  "index": 4,
  "level": "kids-a",
  "topic": "Numbers",
  "titleZh": "数字",
  "wordCount": 8,
  "estMinutes": 5,
  "status": "current",
  "questions": [ /* Question[] */ ]
}
```

| 字段 | 归属 | 说明 |
| --- | --- | --- |
| `index` | **后端** | 第几关，属于课程顺序 |
| `status` | **后端** | `done` / `current` / `locked`，属于学习者进度 |
| `questions` | 内容 | 由 Dify 产出 |

> 这三个字段的拆分是刻意设计的：内容和进度分开存，
> 同一份内容给不同学习者时只需换 `status`，不必复制单元。

### 3.4 Course

```jsonc
{
  "slug": "first-words",
  "titleZh": "自然拼读入门",
  "titleEn": "Phonics Starter",
  "level": "kids-a",
  "domain": "phonics",       // phonics | words | reading | speaking | business
  "unitCount": 12
}
```

---

## 4. 接口详情

### 4.1 POST `/auth/login`

```jsonc
// 请求
{ "account": "13800138000", "password": "...", "mode": "login" }  // mode: login | signup

// 200
{
  "token": "eyJ...",
  "expiresAt": "2026-11-24T08:30:00Z",
  "user": { "id": "u_01HX", "name": "Mia", "level": "kids-a", "role": "learner" }
}
```

> 现状：`/login` 的 `onFinish` 里是 `setTimeout` 模拟。接入时只改这一个函数。

---

### 4.2 GET `/courses`

```
GET /api/courses?level=kids-a&domain=phonics&page=1&pageSize=20
```

```jsonc
// 200
{ "items": [ /* Course[] */ ], "total": 9, "page": 1, "pageSize": 20 }
```

`level` / `domain` 均可选，不传返回全部。

---

### 4.3 GET `/courses/:slug`

```jsonc
// 200
{
  "course": { /* Course */ },
  "units": [ /* Unit[]，含 questions */ ]
}
```

---

### 4.4 GET `/units/:unitId`

最常用的接口。`/learn/unit/[unitId]` 页面进来自动调用。

```jsonc
// 200
{ "unit": { /* Unit，questions 必带 */ } }
```

**错误**

- `404 NOT_FOUND`：单元不存在 → 前端显示「这一关找不到了」+ 回地图按钮
- `403 FORBIDDEN`：单元 `status === 'locked'` 且用户试图直接访问 URL

> 锁定校验放在后端：前端虽然会置灰，但 URL 可以手输，不能只靠 UI 拦。

---

### 4.5 GET `/users/me/progress`

`/learn` 学习地图、`/trial` 体验课都读它。

```jsonc
// 200
{
  "learnerName": "Mia",
  "level": "kids-a",
  "starsToday": 3,
  "starsGoal": 5,
  "starTotal": 128,
  "currentUnitIndex": 4,
  "chestRemaining": 2,
  "units": [ /* Unit[]，不含 questions —— 地图只要状态，别把题目也拖下来 */ ]
}
```

> **性能**：地图页只需要 `unitId / index / status / titleZh`。
> 若后端能把 `units` 换成精简版（`UnitSummary`），首屏能少传几十 KB。
> 前端对 `UnitSummary` 已兼容（`questions` 初始化后异步取）。

---

### 4.6 POST `/users/me/sessions`

单元结算时批量上报，**一次提交，不是每题一次**。

```jsonc
// 请求
{
  "unitId": "kids-a-numbers",
  "startedAt": "2026-10-24T08:00:00Z",
  "finishedAt": "2026-10-24T08:05:12Z",
  "answers": [
    { "questionId": "q_01HX", "correct": true,  "attempts": 1, "elapsedMs": 3200 },
    { "questionId": "q_02HX", "correct": true,  "attempts": 3, "elapsedMs": 9100 },
    { "questionId": "q_03HX", "correct": false, "attempts": 5, "elapsedMs": 15000 }
  ]
}

// 200
{
  "sessionId": "s_01HX",
  "stars": 2,                // 1-3
  "starTotal": 130,
  "chestRemaining": 1,
  "unitStatus": "done",
  "nextUnitId": "kids-a-family"
}
```

**`attempts` 为什么必须传**：学习的核心价值是「哪一题反复错了」。
只传对错，家长端周报的「薄弱项」就算不出来。

**幂等**：同一 `unitId` 在 10 秒内重复提交返回 `409 SESSION_CONFLICT`，
前端收到后忽略（防止双击结算按钮重复加星）。

---

### 4.7 GET `/users/me/words`

`/learn/words` 词卡页。**和词库同步**：当前 114 词。

```jsonc
// 200
{
  "items": [
    {
      "word": "cat",
      "phonetic": "/kæt/",
      "meaningZh": "猫",
      "unitZh": "动物",
      "collected": true,
      "level": "kids-a",
      "audioUrl": "/audio/cat.mp3"   // 可选；缺省时前端走 /api/tts 兜底
    }
  ],
  "total": 114,
  "collectedCount": 10
}
```

> `collected` 由后端算：某词所属单元 `status === 'done'` 即为已收集。
> 现在 `gen-mock-words.mjs` 里是写死的 `COLLECTED` 集合，接后端后删掉即可。

---

### 4.8 GET `/readings`

`/learn/reading` 书架。

```jsonc
// 200
{
  "items": [
    {
      "id": "colors-around-me",
      "titleEn": "Colors Around Me",
      "titleZh": "我身边的颜色",
      "stage": 1,
      "level": "kids-a",
      "tone": "sky",            // sky | mint | peach | lilac | sand
      "unlocked": true,
      "coverImageUrl": "/cards/flower.jpg",
      "readPages": 0,
      "totalPages": 4
    }
  ],
  "total": 7
}
```

单独取一本书的正文：

```jsonc
// GET /api/readings/:id
{
  "book": {
    /* …同上… */
    "pages": [
      {
        "imageUrl": "/cards/flower.jpg",
        "imgAlt": "一朵粉红色的花",
        "sentence": { "en": "This flower is pink.", "zh": "这朵花是粉红色的。", "focus": ["flower", "pink"] }
      }
    ]
  }
}
```

> 书架列表**不返回正文**（7 本书 × 4 页正文没必要全传）。点开再取 `:id`。

---

### 4.9 POST `/users/me/readings/:id/progress`

```jsonc
// 请求
{ "readPages": 3, "lastReadAt": "2026-10-24T08:10:00Z" }

// 200
{ "readPages": 3, "finished": false }
```

> 现状：阅读进度是静态 `readPages`，读完不回写。这是本轮补上的缺口。

---

### 4.10 GET `/users/me/review`

`/learn/review` 到期复习。

```jsonc
// 200
{
  "items": [
    {
      "id": "r1",
      "fromUnitZh": "问候",
      "dueDays": 6,
      "question": { /* Question */ }
    }
  ],
  "total": 5
}
```

`dueDays` 越大越该先复习；前端按此排序，后端按间隔重复算法（SM-2 或 FSRS）算出到期时间。

---

### 4.11 GET `/users/me/rewards`

`/learn/rewards` 一页需要三块数据，合并成一个接口减少往返。

```jsonc
// 200
{
  "badges": [
    {
      "id": "first-unit",
      "name": "第一次闯关",
      "desc": "完成第一个单元",
      "icon": "i-star",
      "earnedAt": "2026-11-03T00:00:00Z",   // 未获得为 null
      "progress": 1,                         // 0-1
      "progressText": "已完成"
    }
  ],
  "chest": { "remaining": 2, "required": 5, "claimable": false, "openedCount": 12 },
  "shop": [
    { "id": "hat", "name": "小皇冠", "price": 50, "owned": true, "level": "kids-a" }
  ]
}
```

---

### 4.12 GET `/reports/weekly`

`/parent` 周报。

```
GET /api/reports/weekly?week=2026-W43
```

```jsonc
// 200
{
  "weekLabel": "第 43 周",
  "minutes": 128,
  "unitsDone": 6,
  "unitsTotal": 12,
  "streakDays": 5,
  "dailyMinutes": [
    { "day": "周一", "minutes": 18 },
    { "day": "周二", "minutes": 24 }
  ],
  "weakSounds": [
    { "sound": "/θ/", "noteZh": "thanks 里把 th 读成 s" }
  ],
  "unitMastery": [ { "unit": "问候", "percent": 92 } ],
  "rows": [
    { "day": "周一", "unit": "问候", "questions": 8, "accuracy": 0.88, "minutes": 18 }
  ]
}
```

`week` 省略时返回本周。格式 `YYYY-Www`（ISO 周）。
> 现状：`/parent` 的「本周/上周」切换是静态的，接了 `week` 参数就能真切换。

---

### 4.13 POST `/admin/generate/units`（仅后台）

```jsonc
// 请求
{ "level": "kids-a", "topic": "Farm Animals", "wordCount": 8, "questionCount": 8 }

// 202
{ "jobId": "job_01HX", "status": "queued" }

// 轮询 GET /api/admin/generate/units/:jobId
{ "jobId": "job_01HX", "status": "succeeded", "unitIds": ["kids-a-farm-01"] }
```

生成是异步的（Dify 跑一轮要几十秒）。**终端用户永远读不到生成中的内容**，
只读 `reviewed: true` 的单元。

---

## 5. 与 Dify 产出的对接

Dify 输出 → 后端补三字段 → 落库 → 本契约。

| Dify 字段 | 落库时谁补 | 目标字段 |
| --- | --- | --- |
| `unitId` `level` `topic` `titleZh` `wordCount` `estMinutes` `questions[]` | 直接存 | 同名字段 |
| — | 后端按课程顺序生成 | `Unit.index` |
| — | 后端按学习者进度算 | `Unit.status` |
| `options[].imagePrompt` | 后端调图库生成后回填 | `options[].imageUrl` |

转换器 `web/src/lib/dify-adapter.ts` 的 `toUnits()` 里目前写死了
`i < 3 ? 'done' : i === 3 ? 'current' : 'locked'`——这是**假进度**，
接入后必须由后端 `progress` 决定，前端删掉这段即可。

---

## 6. 前端接入方式

新增 `web/src/lib/api.ts`，页面从这里取数据，**不再直接 import mock**：

```ts
// 开关：NEXT_PUBLIC_API_MODE=mock | live
export const api = {
  getProgress: () => request<TodayProgress>('/users/me/progress'),
  getUnit: (unitId: string) => request<{ unit: Unit }>(`/units/${unitId}`),
  // ...
};
```

`mock` 模式下走原有 mock 数据（离线开发、演示、E2E 都能用），
`live` 模式下走 `fetch`。**页面代码两种模式完全一致。**

---

## 7. 校验清单（后端交付前自测）

> 这些规则已实现为可执行校验：`GET /api/contract-check`（`CONTRACT_CHECK=1` 启动）。
> 文档写规则、代码验规则，避免两边各自漂移。

- [x] 选择型题（`listen_choose_image` / `read_choose` / `cloze` / `blend_sounds` / `business_scenario`）**至少 2 个**选项
- [x] 单卡型题（`tap_to_read` / `repeat_word`）**恰好 1 个**选项
- [x] 每题**恰好 1 个** `correct: true`
- [ ] 选图题的 `imageUrl` 全部非空（**上线前**必须；mock 阶段允许为空，前端有占位图兜底）
- [x] `audioText` 非空
- [x] `Unit.index` 从 1 连续递增，无跳号
- [x] 每个学习者的 `units` 中**最多一个** `status === 'current'`（刚起步时可以为 0）
- [ ] 锁定单元直接用 URL 访问返回 `403`（需真实后端）
- [x] `unitId` 全局唯一，且符合 `^[a-z0-9-]+$`（它直接是路由参数）

---

## 8. 本轮设计中的关键决策

| 决策 | 理由 |
| --- | --- |
| `unitId` 扁平化，不嵌课程 | 它已是全局唯一 id，且是路由参数；嵌套只会让前端多查一次 slug |
| 内容与进度分离（`index`/`status` 归后端） | 同一份内容给不同学习者，只换进度不复制内容 |
| 作答批量提交而非逐题 | 一次网络往返，且 `attempts` 一起带上，避免中途断开丢掉错题信息 |
| 复习/奖励/词卡都要独立接口 | 各占一个已上线页面，不能只靠 course 接口拼 |
| 书架列表不带正文 | 7 本书正文一次传没必要，点开再取 |
| 保留 `mock` 模式 | 后端未就绪时前端不能停工；也让 E2E 测试不受网络影响 |

---

## 9. 安全注意

1. **答案别提前下发**：`options[].correct` 让任何人都能在 DevTools 里看答案。
   正式实现建议：下发时不带 `correct`，改为提交后由服务端判分并返回对错。
   当前契约保留该字段是为了兼容现有 mock 和离线模式，**上线前应改**。
2. **锁定校验在服务端**：前端置灰只是 UI，URL 可手输。
3. **周报鉴权**：监护人只能看自己名下学习者，`/reports/weekly` 必须校验关系。
4. **限流**：`/auth/login` 与 `/users/me/sessions` 需限流，防撞库与刷星。

---

## 10. 待定项（需要产品/后端拍板）

| # | 问题 | 影响 | 状态 |
| --- | --- | --- | --- |
| 1 | ~~认证方案~~ | `/auth/login` 的请求体形态 | ✅ **已定：邮箱认证**（`{ email, password, mode }`） |
| 2 | 支付渠道：微信 / 支付宝 / Stripe？ | `/pricing` 的下单与回调接口（本文档未覆盖） | 待定 |
| 3 | 语音测评服务选哪家？ | `repeat_word` 打分接口（本文档未覆盖） | 待定 |
| 4 | 复习算法用 SM-2 还是 FSRS？ | `dueDays` 的计算方 | 待定 |
| 5 | 是否真的要把 `correct` 从下发里去掉？ | 改判分流程——**上线前必须定** | 待定 |

### 5 号问题的三个选项

| 选项 | 做法 | 代价 |
| --- | --- | --- |
| A | 保持下发 `correct` | 学生按 F12 就能看答案 |
| B | 判分下沉：作答后提交 `optionId`，服务端返回对错 | 每题一次往返，离线不可判分 |
| C | 字段改名/轻度混淆 | 只提高门槛，挡不住有意作弊 |

> 当前 mock 沿用 A。**如需切 B，前端改动集中在 `use-answer-machine.ts`**，
> 页面组件不用动——这也是答题状态机与界面解耦的原因。
