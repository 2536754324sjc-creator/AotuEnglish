# 后端实现说明

> 与 `docs/api-contract.md`（接口契约）配套。契约定义"要什么"，本文说明"怎么实现"。

---

## 1. 技术选型

| 项 | 选择 | 理由 |
| --- | --- | --- |
| 形态 | 合并进 Next.js（`src/app/api/**/route.ts`） | 一次部署、一套代码；前端不用跨域 |
| ORM | Prisma 7 | 类型安全，迁移可控 |
| 本地数据库 | SQLite（`web/dev.db`） | 零依赖即可跑通 |
| 线上数据库 | PostgreSQL（待接） | 多实例部署需要共享库 |
| 密码 | bcryptjs（cost 10） | 纯 JS，无编译依赖 |
| 会话 | 不透明 token + SHA-256 存储 | 可立即失效；被拖库也无法直接登录 |

---

## 2. 目录

```
web/
├── prisma/
│   ├── schema.prisma            数据模型（15 张表）
│   └── migrations/              迁移历史（进仓库）
├── prisma.config.ts             Prisma 7 配置（含 .env 加载）
└── src/
    ├── generated/prisma/        Prisma Client（gitignore，build 时生成）
    ├── lib/
    │   ├── db.ts                Prisma 单例（driver adapter）
    │   └── server/
    │       ├── auth-server.ts   密码哈希、token 校验
    │       ├── units.ts         单元与词表目录（服务端权威数据）
    │       └── grading.ts       判分、星级、作答落库
    └── app/api/
        ├── health/             健康检查（监控用）
        ├── auth/login/         登录与注册
        ├── auth/logout/        登出（服务端失效 token）
        ├── courses/            课程列表（公开）
        ├── units/[unitId]/     单元详情（不含答案）
        ├── units/[unitId]/check/  单题判分
        ├── users/me/progress/  地图进度
        ├── users/me/sessions/  整关作答上报
        ├── users/me/words/     词卡
        ├── users/me/readings/  读物进度
        ├── users/me/review/    复习队列
        ├── users/me/rewards/   徽章与宝箱
        ├── users/me/plan/      学习计划
        ├── users/me/learners/  学习者档案
        ├── users/me/preferences/ 提醒偏好
        ├── users/me/account/   账号与订阅
        └── reports/weekly/     周报
```

---

## 3. 服务端判分（重要）

**问题**：旧实现把 `options[].correct` 下发给浏览器，按 F12 就能看答案。

**现在**：

1. `GET /api/units/:unitId` 下发选项时 **`correct` 一律为 `false`**
2. 答题机点「检查」时调 `POST /api/units/:unitId/check`，只提交 `{ questionId, optionId }`
3. 服务端返回 `{ correct }`
4. 整关结束时 `POST /api/users/me/sessions` 再按 `optionId` 复核并裁定星级

**已实测验证**：客户端即使谎报 `correct: true`，服务端仍按 `optionId` 判错（测试
`verify-grading-api.cjs` 的「客户端谎报 correct 无效」一项）。

**代价**：每答一题多一次往返。这是契约 §10 选项 B 已预见的成本。

---

## 4. 数据模型要点

| 表 | 作用 | 关键约束 |
| --- | --- | --- |
| `User` | 家长账号 | `email` 唯一 |
| `AuthSession` | 会话 | 只存 token 的 SHA-256 |
| `Learner` | 学习者档案 | 每用户最多 4 个，恰好 1 个 `active` |
| `LearnerProgress` | 地图进度 | `doneUnitsJson` 存已完成单元 |
| `StudySession` | 作答批次 | 含 `attempts`/`elapsedMs` 明细 |
| `LearnerWord` | 词卡收集 | `(learnerId, word)` 唯一 |
| `ReviewItem` | 复习队列 | 答错入队，`dueDays` 排序 |
| `WeeklyReport` | 周报快照 | 预留，当前实时聚合 |

**为什么列表字段用 JSON 字符串**：SQLite 不支持原生数组。切 PostgreSQL 后可改为
`String[]`，但会带来迁移成本，暂不必要。

---

## 5. 本地运行

```bash
cd web
cp .env.example .env      # 已存在则跳过
npm install
npx prisma migrate dev    # 建库
npm run dev
```

`.env` 里 `NEXT_PUBLIC_API_MODE` 决定数据来源：

- `mock` —— 用前端本地假数据，不需要数据库
- `live` —— 走真实 API 与数据库

**切换后必须重启 dev server**，且 `.next` 缓存要清（Prisma 单例是 `globalThis` 缓存的）。

---

## 6. 已知限制

| 项 | 现状 |
| --- | --- |
| 支付 | 未实现，`/parent/account` 明确显示「尚未开通」 |
| 装扮商店 | 占位，接口返回 `available: false` |
| 复习算法 | 最朴素（答错入队），未上 SM-2/FSRS |
| 内容来源 | 单元目录硬编码在 `lib/server/units.ts`，应由内容管线写入数据库 |
| 部署 | 仅本地跑通；上线需接 PostgreSQL + 迁移 |

---

## 7. 上线前必须做

1. `DATABASE_URL` 指向 PostgreSQL，`schema.prisma` 的 `provider` 改为 `postgresql`
2. `lib/db.ts` 的 adapter 换成 `@prisma/adapter-pg`
3. 跑 `npm run db:deploy`（生产用 `migrate deploy`，不是 `migrate dev`）
4. `NEXT_PUBLIC_API_MODE=live`
5. 生成迁移前先备份一次数据库

---

## 8. 验证方式

```bash
# 后端接口
node verify-auth-api.cjs       # 鉴权 13 项
node verify-grading-api.cjs    # 判分 18 项
node verify-api-full.cjs       # 全接口 36 项

# 前端
node verify-regression.cjs     # 全路由 22 项
node verify-live-e2e.cjs       # live 模式端到端 18 项（需先切 live）

# 单元测试
node verify-unit-report.mts    # 上报载荷 10 项
node verify-progress.mts       # 进度推导 9 项
```
