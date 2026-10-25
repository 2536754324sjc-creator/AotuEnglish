# AotuEnglish 项目总结与计划大纲

> **最后更新：2026-10-25（第二轮）** —— 前端收尾 + 后端建成 + 上线准备完成
> 本文档是完整的项目状态快照，新会话从这里接手即可，无需翻历史。
> 配套文档：`docs/api-contract.md`（接口契约）、`docs/backend.md`（后端实现）、
> `docs/deploy.md`（上线步骤）、`docs/frontend-plan.md`（产品规划）

---

## 0. 一分钟了解现状

**前端完整、后端已建成、前后端已打通。** 本地 mock 与 live 两种模式都跑通，上线只差部署操作。

| 维度 | 完成度 |
| --- | --- |
| 页面与交互 | **100%** —— 19 个页面路由，7 种题型，家长端 4 个子页已补全 |
| 内容资源 | **100%** —— 114 词卡(图+音+词条)、7 本读物 |
| 性能 / SEO | **95%** —— 字体省 90%、图片省 66%、SEO 全套 |
| 鉴权 | **100%** —— 真实后端，bcrypt + 不透明 token |
| 数据持久化 | **100%** —— 进度/作答/词卡/复习/周报全部落库 |
| 服务端判分 | **100%** —— 答案不再下发，服务端裁决 |
| 支付 | **0%** —— 按用户要求放最后；页面明确写「尚未开通」 |
| 部署 | **就绪待执行** —— 配置与文档齐备，需在 Vercel/Neon 上操作 |

**本轮已解决的历史问题**：
1. ✅ 价格页 `/signup` 断链 → 改为 `/login?mode=signup`，登录页识别 `?mode=`
2. ✅ 作答不上报 → 单元页调 `submitSession`，结算页星星来自服务端
3. ✅ 无后端 → 18 个 API 路由 + 15 张表（Prisma）
4. ✅ 鉴权是 mock → 真实注册/登录/登出，token 哈希存储
5. ✅ 答案随题下发 → 服务端判分，客户端谎报 `correct` 无效
6. ✅ 词卡「已收集」写死 → 按已完成单元解锁
7. ✅ 读物进度不回写 → 翻页即记录，只前进不后退
8. ✅ 家长端 4 个空壳页 → 全部实现并可读写

**仍存在的真实缺口**（都已明确标注，没有假装能用）：
- 支付未接（`/parent/account` 显示「在线支付尚未开通」）
- 装扮商店占位（接口返回 `available: false`）
- 跟读不打分（需要第三方语音测评服务）
- 英文界面未做（偏好页标为「即将支持」，后端拒绝切 en）

---

## ⚠️ 强制规则

**每做完 3 个任务，必须提交并推送到 GitHub。**

```bash
cd F:\AotuEnglish
git add -A
git commit -m "说明这次改了什么"
git push origin master
```

- 仓库：https://github.com/2536754324sjc-creator/AotuEnglish
- 分支：`master`（不是 `main`）
- 提交前必须跑 `npx tsc --noEmit` 和 `npm run build`
- **推送超时是常态**（GitHub 443 连接不稳定），等 20–45 秒重试，不要改配置

---

## 一、项目是什么

一个**不限年龄**的英语学习网站。靠内容分层适配 4 岁到成人，而不是做多个产品。

- **学习者端**：看得见进度的学习地图，每过一关前进一格，答对立刻有回响
- **监护人端**：只讲事实的学习周报——时长、完成度、薄弱项，**没有排行榜，不公开比较**
- **核心循环**：今日任务 → 地图闯关 → 即时奖励 → 复习 → 家长周报

### 四档内容分层

| level | 年龄 | 界面密度 | 题量 | 吉祥物 |
| --- | --- | --- | --- | --- |
| `kids-a` | 4–7（首发主档） | 大图少字，触控 ≥200px | 6–8 | 有 |
| `kids-b` | 7–12 | 中图 + 短句 | 8–10 | 有 |
| `teen` | 13–16 | 文字为主 | 10–12 | 无 |
| `adult` | 17+ / 商务 | 信息密集 | 12–15 | 无 |

页面**不随年龄增删**，同一套路由靠 `level` 字段切密度。

---

## 二、已完成内容（逐项核实）

### 2.1 页面路由（19 个，全部可用）

| 路由 | 内容 | 状态 |
| --- | --- | --- |
| `/` | 首页：SSR 地图切片 + 三步闭环 + 四档分层 + 课程体系 | ✅ |
| `/courses` | 课程体系：年龄 × 领域双筛选，9 门课 | ✅ |
| `/pricing` | 价格：三档方案 + 月付/年付切换 | ⚠️ CTA 断链（见 §四） |
| `/login` | 邮箱登录/注册，真实调用 `api.login()` | ✅ |
| `/help` | FAQ 帮助页（含 FAQPage 结构化数据） | ✅ |
| `/trial` | 体验课：免登录直接玩第 1 题 | ✅ |
| `/learn` | 学习地图：5 关、三态节点、路径描画、吉祥物 | ✅ 需登录 |
| `/learn/words` | 词汇图卡：114 张，11 组，点卡发音 | ✅ |
| `/learn/reading` | 分级读物：7 本书，书架 + 阅读器，点词朗读 | ✅ |
| `/learn/review` | 复习：到期天数排序 + 复用答题机 | ✅ |
| `/learn/rewards` | 奖励：宝箱 + 徽章墙 + 装扮商店(占位) | ⚠️ 商店未开放 |
| `/learn/speak` | 跟读：录音 + 波形，**不打分** | ⚠️ 无评分 |
| `/learn/unit/[unitId]` | 单元答题：7 种题型 | ✅ |
| `/learn/unit/[unitId]/done` | 结算：星星逐颗落下 | ✅ |
| `/parent` | 学习周报：三数字 + 图表 + 薄弱项 + 明细表 | ✅ 需登录 |
| `/parent/plan` | 学习计划 | ❌ **空壳占位（18 行）** |
| `/parent/learners` | 学习者管理 | ❌ **空壳占位（18 行）** |
| `/parent/settings` | 学习偏好 | ❌ **空壳占位（19 行）** |
| `/parent/account` | 账号与订阅 | ❌ **空壳占位（18 行）** |

### 2.2 API 路由（2 个）

| 路由 | 用途 |
| --- | --- |
| `/api/tts` | TTS 代理：百度主、有道兜底、内存缓存 |
| `/api/contract-check` | 契约自测：24 项断言（`CONTRACT_CHECK=1` 启动后访问） |

### 2.3 七种题型（全部实现并实测）

| 题型 | 组件 | 演示地址 | 交互 |
| --- | --- | --- | --- |
| `listen_choose_image` | `picture-choice.tsx` | 主课程 | 听音选图 |
| `tap_to_read` | `tap-card.tsx` | 主课程 | 点卡听音 |
| `read_choose` | `text-choice.tsx` | 主课程 | 读后选择 |
| `cloze` | `text-choice.tsx` | 主课程 | 复用文字选择 |
| `repeat_word` | `repeat-word.tsx` | `/learn/unit/demo-repeat` | 按住跟读 |
| `blend_sounds` | `blend-sounds.tsx` | `/learn/unit/demo-blend` | 字母磁贴拼词，逐位标红 |
| `business_scenario` | `business-scenario.tsx` | `/learn/unit/demo-business` | 对话气泡 + 整句回复 |

### 2.4 内容资源（100% 完成）

| 类型 | 数量 | 体积 |
| --- | --- | --- |
| 图卡 JPG | 114 张 | 5.53 MB |
| 图卡 WebP | 114 张 | 1.87 MB |
| 音频 MP3 | 114 个 | 1.88 MB |
| 词条 | 114 个，11 组 | — |
| 分级读物 | 7 本（28 页） | — |
| 课程单元 | 5 个（kids-a） + 1 teen 样例 + 3 演示 | — |

### 2.5 数据访问层（已全部迁移）

**9 个页面全部走 `api.ts`，不再直接 import mock**。切换后端只需设环境变量：

```ts
// NEXT_PUBLIC_API_MODE=mock（默认）| live
import { api } from '@/lib/api';        // 纯数据层，服务端可用
import { useApi } from '@/lib/use-api'; // 客户端 hook
```

**为什么拆两个文件**：`api.ts` 被服务端组件引用，一旦 import React hooks 会报 RSC 边界错误。**不要把 hook 写回 `api.ts`。**

### 2.6 鉴权（前端骨架完成）

| 能力 | 状态 |
| --- | --- |
| 邮箱认证方案 | ✅ 已定 |
| 表单校验（邮箱格式、密码 ≥8、二次确认） | ✅ |
| `POST /auth/login` 契约 + mock（含 401/409/400） | ✅ |
| token 存储（localStorage，30 天过期自动清理） | ✅ |
| 登录态广播 | ✅ |
| 路由守卫：`/learn/*`、`/parent/*` 全部强制登录 | ✅ |
| 登录后回跳 `?next=` | ✅ |
| 首页导航显示头像 + 用户名 | ✅ |

**mock 登录的可测分支**：`wrong@example.com` → 401；注册用 `taken@example.com` → 409；密码 <8 位 → 400；其余任意邮箱成功。

### 2.7 性能优化（已做两项）

**字体子集化 —— 单页字体下载 3439 KB → 348 KB（省 90%）**

三款字体均为 **SIL OFL 1.1，可免费商用**（已核实三层证据）：
| 字体 | 版权方 | 上游 |
| --- | --- | --- |
| Baloo 2 | The Baloo 2 Project Authors (EkType) | google/fonts |
| ZCOOL KuaiLe | The ZCOOL KuaiLe Project Authors | google/fonts |
| Noto Sans SC | Google Inc. | google/fonts |

均**未声明 Reserved Font Name**，子集化后可保留原名。许可证全文在 `public/fonts/OFL.txt`。

**改文案后不需要手动处理**：`npm run build` 会自动检测字符集变化并重建子集。
缺字**不会显示豆腐块**（浏览器回退系统字体，只是字形略不统一）。

**图卡 WebP —— 5.53 MB → 1.87 MB（省 66%）**

用 `canvas.toDataURL` 探测 + `useLayoutEffect` 首次绘制前切换，无重复请求，JPG 保留作为回退。

### 2.8 SEO（完整）

| 能力 | 实现 |
| --- | --- |
| 站点配置单一来源 | `src/lib/site.ts` |
| metadataBase + 标题模板 | `app/layout.tsx` |
| canonical / OG / Twitter Card | 每个公开页显式声明 |
| 1200×630 分享图 | `scripts/gen-og.mjs` 代码绘制 |
| JSON-LD | Organization / WebSite / Course / FAQPage / EducationalOrganization |
| robots.txt / sitemap.xml / manifest | 约定式生成 |
| 私人页 noindex | `/learn/*`、`/parent`、`/login` |

**关键决策**：私人页用 noindex 而非 robots Disallow（Disallow 会让爬虫看不到 noindex，页面仍可能以「只有标题」出现）。

### 2.9 工程工具

| 脚本 | 用途 |
| --- | --- |
| `npm run dev` / `build` / `start` | 标准流程 |
| `npm run fonts` | 手动重建字体子集（build 已自动） |
| `npm run fonts:check` | 校验字体零缺字 |
| `scripts/gen-webp.mjs` | 批量转 WebP |
| `scripts/gen-og.mjs` | 生成分享图 |
| `scripts/gen-mock-words.mjs` | 从词库重建词卡数据 |
| `scripts/check-readings.mjs` | 校验读物插图存在 |
| `scripts/gen-wordbank.mjs` | 批量生成图卡 |
| `scripts/gen-audio.mjs` | 批量下载音频 |
| `启动开发服务器.bat` + 桌面快捷方式 | 双击启动并自动开浏览器 |

### 2.10 验证状态（最近一次实测）

- 19 个页面浏览器回归**全部通过**，零控制台错误
- 三种新题型交互流程全部实测通过（拼对/拼错/录音/选择）
- 契约自测 24/24
- `tsc` + `build` 通过，22 个路由
- 字体 723 汉字 + 62 拉丁零缺字

---

## 三、尚未完成（按优先级）

### 🔴 阻塞上线（必须解决）

| # | 问题 | 说明 | 影响 |
| --- | --- | --- | --- |
| 1 | ~~后端完全不存在~~ | ✅ **已解决**：18 个 API 路由 + Prisma + 15 张表 | — |
| 2 | ~~做题结果不保存~~ | ✅ **已解决**：单元页调 `submitSession`，星级由服务端裁定 | — |
| 3 | **支付未接** | 价格页 CTA 已修（不再 404）；但**没有下单/回调接口** | 无法收费。按用户要求放最后 |
| 4 | ~~鉴权是 mock~~ | ✅ **已解决**：真实注册/登录/登出，bcrypt + token 哈希 | — |

### 🟠 功能缺口

| # | 问题 | 说明 |
| --- | --- | --- |
| 5 | ~~`/parent` 四个子页是空壳~~ | ✅ **已解决**：计划/学习者/偏好/账号全部实现并接后端 |
| 6 | 装扮商店未开放 | 接口返回 `available: false`，不假造可兑换商品 |
| 7 | 跟读不打分 | 只录音。**刻意不编造分数**，需第三方语音测评服务 |
| 8 | ~~词卡「已收集」写死~~ | ✅ **已解决**：按已完成单元解锁，live 模式由数据库决定 |
| 9 | ~~读物进度不保存~~ | ✅ **已解决**：翻页即记录，只前进不后退 |
| 10 | OU 工作流产不出新题型 | 目前只产出 4 种；其余 3 种已在前端实现，待内容管线产出 |
| 11 | ~~`/signup` 路由缺失~~ | ✅ **已解决**：指向 `/login?mode=signup`，登录页识别该参数 |

### 🟡 技术债 / 优化

| # | 问题 | 说明 |
| --- | --- | --- |
| 12 | token 存在 localStorage | 应改 httpOnly cookie；且守卫在客户端跑，会闪一下受保护内容 |
| 13 | 前端守卫只是 UX 层 | 服务端接口已做鉴权（401），但页面级重定向仍在客户端 |
| 14 | ~~`options[].correct` 随题目下发~~ | ✅ **已解决**：服务端判分，下发时一律 `false` |
| 15 | 百度/有道 TTS 合规风险 | 是网页内部接口，非公开 API。114 个词已本地化，新词建议换 Azure |
| 16 | 图卡背景有色差 | 10 张之间 rgb 184–237，尝试统一失败（会误伤白色主体） |
| 17 | 图表数值靠图下摘要 | G2 5 的 label 不支持 `position`（源码标 `@todo`） |
| 18 | 路由预取未做 | 最后一项性能优化 |
| 19 | 字体子集需重生成 | ⚠️ 改了文案若未跑 build，新字会用系统字体（不报错但字形不统一） |
| 20 | 单元内容硬编码 | `lib/server/units.ts` 是静态目录，应由内容管线写入数据库 |
| 21 | 每答一题多一次往返 | 服务端判分（契约 §10 选项 B）的既定代价 |

---

## 四、已知 Bug

**当前无已知未修 Bug。** 本轮修复记录：

| 已修 | 说明 |
| --- | --- |
| 价格页 CTA 断链 | `/signup` → `/login?mode=signup`，实测不再 404 |
| 作答不上报 | 单元页调 `submitSession`，实测进度/词卡/周报全部更新 |
| token 键名不一致 | `api.ts` 读 `'token'` 而 `auth.ts` 写 `'aotu.token'`，导致登录后请求从不带 token |
| 服务端判分导致卡关 | 下发答案全是 false 后前端永远答不对；新增 `/units/:id/check` 逐题判分 |
| 徽章判定错误 | 原按每 15 星解锁，导致「完成第一关」徽章无法解锁；改为按语义条件 |
| `.chars.txt` 含二进制脏数据 | 重新生成后为干净字符集（字体文件本身未变） |
| Prisma 生成物放在 src/ 下 | 导致 Next 持续重编译、浏览器测试随机 ERR_ABORTED；已移出 src |


---

## 五、技术栈

| 层 | 选型 | 许可 |
| --- | --- | --- |
| 框架 | Next.js 16.4.2（App Router + Turbopack） | MIT |
| UI | React 19 + Ant Design 6.6.6 | MIT |
| **ORM** | **Prisma 7**（+ driver adapter） | Apache-2.0 |
| **本地数据库** | **SQLite**（better-sqlite3 adapter） | MIT |
| **线上数据库** | **PostgreSQL**（@prisma/adapter-pg，计划用 Neon） | PostgreSQL 许可 |
| **鉴权** | **bcryptjs + 不透明 token（SHA-256 存储）** | MIT |
| 字体 | Baloo 2 / ZCOOL KuaiLe / Noto Sans SC | **OFL-1.1（可商用）** |
| 动效 | GSAP 3 + @gsap/react | Webflow 标准许可（商用免费） |
| 平滑滚动 | Lenis 1.3 | MIT |
| 图表 | @ant-design/charts 2.6（G2） | MIT |
| 2D Canvas | Pts 1.0.3 | Apache-2.0 |
| 字体子集工具 | fontTools + brotli（Python） | MIT |

**架构**：营销页 SSR/预渲染，学习端与家长端客户端渲染，API 与前端同项目部署。

---

## 六、核心技术约定（改动前必读）

1. **UI 系统只有 AntD 一个**，学习端大画面是 AntD token + 自有组件
2. **答题状态机在 `use-answer-machine.ts`**，与界面解耦，`select(id)` + `check()` 两个动作
3. **答错不扣星、不判负**，无限重试；只有 `phase === 'correct'` 才锁卡片
4. **设计令牌在 `src/design/tokens.ts`**，页面里不写十六进制
5. **`unitId` 不能随便改**，它直接是路由参数
6. **页面不直接 import mock**，一律走 `api.ts` + `use-api.ts`
7. **`api.ts` 不能 import React**，hook 必须在 `use-api.ts`
8. **改动文字后跑一次 `npm run build`**，会自动重建字体子集
9. **Windows 上不要用 PowerShell 读写含中文的源码**，会破坏编码（曾造成 44 行乱码）
10. **README 路线**：`docs/api-contract.md` 是后端唯一契约来源

---

## 七、快速上手

### 启动

双击桌面「**AotuEnglish 开发服务器**」，或：

```bash
cd F:\AotuEnglish\web
npm run dev        # http://localhost:3000
```

### 测试账号

- 邮箱：`mia@example.com`
- 密码：`password123`

### 常用命令

```bash
npx tsc --noEmit     # 类型检查
npm run build        # 生产构建（会自动维护字体子集）
python scripts/check-fonts.py   # 字体缺字检查
```

### 关键路径

```
F:\AotuEnglish\
├── HANDOFF.md                    本文件
├── 启动开发服务器.bat
├── docs\
│   ├── api-contract.md           ★ 后端契约（13 个接口）
│   └── frontend-plan.md          产品规划
└── web\
    ├── src\
    │   ├── app\                  19 个页面 + 2 个 API
    │   ├── design\               令牌 + AntD 主题
    │   ├── i18n\                 文案字典
    │   ├── components\           图标、地图、导航、状态页、JSON-LD
    │   ├── features\             learn（7 题型）/ parent
    │   └── lib\                  api / auth / types / mock / speak
    ├── public\cards               114 JPG + 114 WebP
    ├── public\audio               114 MP3
    ├── public\fonts               子集字体 + OFL.txt
    ├── scripts\                   生图 / 生音 / 词库 / 字体 / OG
    └── dify\                     OU 工作流
```

---

## 八、验证方法（复用经验）

**不要只看截图**，很多 bug 只在真实交互中暴露。用 puppeteer-core + 系统 Chrome：

```javascript
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox'],
});
```

**踩过的坑**：
- AntD 按钮文字是「登 录」（中间有空格），选择器要去空白
- AntD 的 `Input` 渲染成 `type="text"`，不是 `type="email"`
- 直接赋 `input.value` 不触发 React 更新，要用 `page.keyboard.type`
- `networkidle0` 对有长任务的页面会超时，改用 `domcontentloaded`
- 测试脚本的字符串匹配可能误判（如「装扮商店还在做」被当成题型占位）
- 热更新残留会导致 hydration 误报，清 `.next` 重启
- **固定 sleep 等登录不可靠**：应轮询 token 落盘再继续，否则整批断言误报未登录
- **`allowPrivileged` 类端口占用**：旧的 next dev 进程不退出会让新实例换端口，
  结果是测试打到了旧代码。用仓库根的 `stop-dev.ps1` 清理
- **Prisma 生成物不能放 src/**：会触发持续重编译，导致测试随机 `ERR_ABORTED`
- **PowerShell 的 `-replace` + `Set-Content` 会破坏中文文件编码**：改中文内容一律用编辑器或 Node 脚本

**测试脚本**（均在 `web/` 下，已被 gitignore）：

```bash
node verify-auth-api.cjs        # 鉴权 13 项
node verify-grading-api.cjs     # 服务端判分 18 项
node verify-api-full.cjs        # 全接口 36 项
node verify-regression.cjs      # 全路由 22 项
node verify-live-e2e.cjs        # live 端到端 18 项（需切 live 模式）
node verify-progress-flow.cjs   # 进度联动 10 项
node verify-unit-report.mts     # 上报载荷 10 项
node verify-progress.mts        # 进度推导 9 项
```

---

## 九、下一步建议（按价值排序）

1. **执行上线** —— 按 `docs/deploy.md` 操作：Neon 建库 → Vercel 部署 → `migrate deploy`
2. **接支付** —— 需先定渠道（微信/支付宝/Stripe），这是目前唯一阻止收费的缺口
3. **接 Azure TTS** —— 解决合规风险，也是新词的唯一正路
4. **语音测评** —— 让跟读有真实分数（需选服务商）
5. **内容管线** —— 单元从 `lib/server/units.ts` 迁移到数据库
6. **token 改 httpOnly cookie** —— 降低 XSS 风险


---

## 十、当前状态一句话

**前端完整（19 页面 + 7 题型 + 114 词全资源）、后端建成（18 个 API + 15 张表 + 服务端判分）、
前后端已打通并实测通过；只差按 `docs/deploy.md` 在 Vercel + Neon 上真正部署，以及最后接支付。**
