# AotuEnglish 项目交接

> 最后更新：2026-10-21 · 完成获客闭环后
> 用途：新会话从这里接手，不用翻历史

---

## ⚠️ 强制规则：每 3 个任务推送一次

**每做完 3 个任务，必须把本地改动提交并推送到 GitHub 仓库，保持远端数据最新。**

```bash
cd F:\AotuEnglish
git add -A
git commit -m "说明这次改了什么"
git push origin master
```

- 仓库：https://github.com/2536754324sjc-creator/AotuEnglish
- 分支：`master`（不是 `main`）
- 提交前必须先跑 `npx tsc --noEmit` 和 `npm run build`，两者通过才提交
- 推送前用 `git ls-remote --heads origin master` 确认远程可达；
  若 `github.com:443` 超时（常见网络波动），等 20 秒重试，不要改配置

---

## 1. 一句话现状

**Next.js 工程已跑起来，学习闭环与获客闭环都已打通。** 24 个规划路由里做完 13 个，
全部通过类型检查、生产构建和真实浏览器验证。

- 项目位置：`F:\AotuEnglish`
- 前端工程：`F:\AotuEnglish\web`
- 启动方式：`cd F:\AotuEnglish\web && npm run dev` → http://localhost:3000
- 服务状态：dev server 由会话托管，**会话结束即停止**。下次打开前先确认端口 3000；
  不在就重新 `npm run dev`。

---

## 2. 已验证的事实（不用重做）

| 项 | 结论 |
| --- | --- |
| 生产构建 | 9 个路由全部成功；`/` `/learn` `/parent/*` 静态预渲染，`/learn/unit/*` 动态渲染 |
| 类型检查 | `tsc --noEmit` 0 错误 |
| 页面可用 | `/` `/learn` `/parent` 及 4 个子页、`/learn/unit/kids-a-numbers`、`/learn/unit/teen-school-01` 全部 200 |
| 响应式 | 1440×900 与 390×844 无横向溢出（脚本实测 `scrollWidth === viewport`） |
| 答题流程 | 地图 → 选关 → 6 题（含答错重试）→ 结算 → 回地图，全流程跑通 |
| 四种题型 | `listen_choose_image` / `tap_to_read` / `read_choose` / `cloze` 均正确渲染 |
| OU 工作流 | 4 个 Code 节点 Python 实跑通过；畸形 JSON 容错 3 类、坏题拦截 3 类、汇总 6 边界全通过 |
| 安全性 | 未发现硬编码 API Key |

**仍未被验证的（唯一）**：OU 工作流的**真实 LLM 调用**。本机没有 Dify 实例和智谱 API Key。
导入 Dify 后先跑一次 `kids-a` + `farm animals`，重点看 `warnings` 是否大量出现「题数偏少」。

---

## 3. 产品目标（不变的部分）

不限年龄的英语学习产品，靠**内容分层**适配不同人群，不靠不同产品。

- **学习者**：一张看得见进度的学习地图，每过一关前进一格，答对立刻有回响
- **监护人**：只讲事实的周报——时长、完成度、薄弱项，**没有排行榜**，不公开比较
- **核心循环**：今日任务 → 地图闯关 → 即时奖励 → 复习 → 家长周报

### 四档内容分层（唯一需要长期维护的维度）

| level | 年龄 | 密度 | 题量 | 吉祥物 |
| --- | --- | --- | --- | --- |
| `kids-a` | 4–7（首发主档） | 大图少字，触控 ≥200px | 6–8 | 有 |
| `kids-b` | 7–12 | 中图 + 短句 | 8–10 | 有 |
| `teen` | 13–16 | 文字为主 | 10–12 | 无 |
| `adult` | 17+ / 商务 | 信息密集 | 12–15 | 无 |

页面**不随年龄增删**，同一套路由靠 `level` 字段切密度。这是整套设计的地基。

---

## 4. 已完成 / 未完成

### 已完成（13 个路由）

| 路由 | 内容 |
| --- | --- |
| `/` | 首页：首屏真实地图切片 + 三步闭环 + 四档分层 + 内容体系 |
| `/trial` | **体验课**：不注册直接玩第 1 题，玩完才留资；邮箱校验 + 可跳过 |
| `/courses` | **课程体系**：年龄 × 领域双筛选，9 门课覆盖四档 |
| `/pricing` | **价格页**：三档方案 + 月付/年付切换（折扣按实价算） |
| `/login` | **注册登录**：双模式切换，完整表单校验，服务端错误展示 |
| `/learn` | 学习地图：节点三态、路径描画、吉祥物、宝箱进度、单元弹层、暂停弹层 |
| `/learn/unit/:lessonId` | 单元学习：四种题型、答题状态机、答错无限重试、退出确认 |
| `/learn/unit/:lessonId/done` | 结算：星星逐颗落下，文案随星数变化 |
| `/parent` | 学习周报：三个数字 + G2 每日时长图 + 薄弱环节 + 单元掌握 + 7 行明细 |
| `/parent/plan`、`/parent/learners`、`/parent/settings`、`/parent/account` | 占位页，导航可用 |

**获客闭环已打通**：首页 → 课程 → 体验课（不注册）→ 注册 → 订阅。

### 未完成

**学习端子页**：`/learn/review`、`/learn/words`、`/learn/reading`、`/learn/speak`、`/learn/rewards`

**技术欠账**：
- 音频还在用浏览器 `SpeechSynthesis` 兜底，需接真 TTS（改 `picture-choice.tsx` / `tap-card.tsx` / `text-choice.tsx` 里的 `speak()`）
- 图卡用几何占位图，需按 `imagePrompt` 走图库生成后回填 `imageUrl`
- 题型缺口：`repeat_word`（要录音）、`blend_sounds`（要拼读音频切分）、`business_scenario`（要商务对话）
- `/login` 的提交是模拟的，接真实鉴权时替换 `onFinish` 内的 `setTimeout`

---

## 5. 内容生产链路（OU 工作流）

```
web/dify/OU.yml           Dify 工作流，产出前端可直渲染的单元 JSON
web/dify/README.md        用法、改动对照、字段缺口、验证结论
web/src/lib/sample-ou-course.json   OU 样例（kids-a 农场，第 4 关在用）
web/src/lib/sample-ou-teen.json     OU 样例（teen 校园）
web/src/lib/dify-adapter.ts         转换器
web/src/lib/mock-data.ts            当前数据源
```

**接后端时只改 `mock-data.ts`**：把 `getUnit` / `mockTodayProgress` 换成 API 调用，页面与组件一行不动。

OU 产不出、要后端补的三个字段（已写进文档）：

| 字段 | 为什么 |
| --- | --- |
| `Unit.index` | 第几关属于课程顺序 |
| `Unit.status` | `done`/`current`/`locked` 属于学习者进度 |
| `Option.imageUrl` | OU 只给 `imagePrompt`，需调图库后回填 |

---

## 6. 下一步（按这个顺序做）

获客页面（`/trial`、`/courses`、`/pricing`、`/login`）已于 2026-10-21 全部完成。
接下来做学习端子页：

1. **`/learn/words` 词卡** —— 组件最简单，复用现有图片卡与发音逻辑
2. **`/learn/review` 复习** —— 复用答题状态机，加「到期内容」的选择逻辑
3. **`/learn/speak` 跟读** —— 需要麦克风权限处理，配合 Pts 画声波
4. **`/learn/reading` 分级读物** —— 书架 + 翻页 + 点读
5. **`/learn/rewards` 奖励** —— 宝箱 + 徽章墙
6. **真实化** —— 接 TTS、接图库、接后端 API

**技术债优先级比新页面高**：现在音频是浏览器合成、图卡是占位几何图形，
这两项不解决，产品看起来还是「演示品」。

---

## 7. 核心技术约定（接手必读，别推翻）

- **UI 系统只有 AntD 一个**。学习端的大画面是 AntD token + 自己的组件，不是第二套系统。
- **文案全部走 `src/i18n/index.ts`**，不写死中文。成人档切英文只需加字典，不改页面。
- **答题状态机在 `src/features/learn/use-answer-machine.ts`**（在 features 下，不在 components），
  与界面解耦。改动规则只动这里。
- **答错不扣星、不判负**，允许无限重试；只有 `phase === 'correct'` 才锁卡片。这条曾被我写错过导致死锁，别改回去。
- **设计令牌在 `src/design/tokens.ts`**，色彩/圆角/阴影/字号全在那。页面里不写十六进制。
- **动效三条主序列**：地图进场、答题反馈、结算推进。别的地方不加动效。
- **不用 3D/WebGL**，地图和吉祥物 SVG 已足够。
- **`unitId` 不能随便改**，它直接是路由参数。
- **占位图哈希用整串 prompt，不能用首字符**——OU 的 `imagePrompt` 都以 `a cartoon` 开头，用首字符会导致所有图同色。

---

## 8. 目录速查

```
F:\AotuEnglish\
├── docs\frontend-plan.md        前端页面规划（最完整的产品文档）
├── design\kid\map.html          学习地图原始原型（已验证， CSS 数值的源头）
├── web\                         前端工程
│   ├── src\
│   │   ├── app\                 路由
│   │   ├── design\              令牌 + AntD 主题
│   │   ├── i18n\                文案字典
│   │   ├── components\          共享组件（图标表、地图、弹层）
│   │   ├── features\            learn / parent 功能组件
│   │   ├── lib\                 类型、mock 数据、OU 适配器
│   │   └── styles\global.css
│   ├── dify\                    OU 工作流 + 说明
│   ├── shots\                   17 张验证截图
│   └── README.md                工程说明
└── .agents\skills\ui-done\      UI 规范（改视觉前先读）
```

---

## 9. 接手后第一件事

确认端口 3000，然后 `npm run dev`，打开 http://localhost:3000 看一眼首页和 `/learn`。

如果 dev server 起不来，先试 `rm -rf .next && npm run dev` 清缓存。
