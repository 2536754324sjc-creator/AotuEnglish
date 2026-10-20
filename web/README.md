# AotuEnglish Web

英语学习网站的 Next.js 前端。**营销页 SSR/预渲染，学习端与监护端客户端渲染。**

规划文档见 [`../docs/frontend-plan.md`](../docs/frontend-plan.md)。

## 运行

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 生产构建（三个路由全部预渲染为静态）
npm run start    # 跑生产构建
npm run typecheck
```

## 技术栈

| 层 | 选型 | 许可证 |
| --- | --- | --- |
| 框架 | Next.js 16.4.2（App Router） | MIT |
| UI 系统 | Ant Design 6.6.6 + @ant-design/icons 6 | MIT |
| 字体 | Baloo 2 / ZCOOL KuaiLe / Noto Sans SC（self-host） | OFL-1.1 |
| 动效 | GSAP 3 + @gsap/react | Webflow Standard「No Charge」**非 MIT** |
| 平滑滚动 | Lenis 1.3（仅长页使用） | MIT |
| 图表 | @ant-design/charts 2.6（G2） | MIT |
| 2D Canvas | Pts 1.0.3 | Apache-2.0 |

GSAP 商用免费，但禁止用于与 Webflow 竞争的「可视化无代码动画工具」。本项目符合条件，
需在发布物中保留其声明。

## 目录

```
src/
  app/            路由与布局
    layout.tsx    根布局（AntdRegistry + Providers）
    providers.tsx ConfigProvider：唯一主题所有者
    page.tsx      首页（SSR/预渲染）
    learn/        学习端（客户端渲染）
  design/
    tokens.ts     设计令牌：色彩/圆角/阴影/字号/四档内容配置
    antd-theme.ts AntD token 映射
  i18n/           文案字典（zh / en）+ 插值
  components/     共享组件
    icon-sprite.tsx    全站 SVG 图标符号表
    learn-map/         LearnMap + 顶栏（首页与学习端共用同一个）
    unit-sheet.tsx     单元介绍底部弹层
    pause-card.tsx     「先停一下」弹层
  lib/
    types.ts      接口契约类型（对应 docs §5.1）
    mock-data.ts  Mock 数据，接后端时只换这个文件
  styles/global.css  reset + CSS 变量
```

## 已实现的约定

- **文案全部走 `i18n`**：页面里不写死中文。成人档切英文界面时加一份字典即可，不改页面。
- **内容档 `level` 决定密度**：`kids-a` / `kids-b` / `teen` / `adult` 控制节点尺寸、
  图卡大小、每单元题数与是否出现吉祥物，不决定路由。
- **`LearnMap` 一个组件两处用**：首页切片与学习端是同一个组件，只换 `variant` 与数据。
- **无年龄限制、无 PIN、无强制休息**：暂停弹层是纯手动的「先停一下」，不计时。
- **不使用 3D/WebGL**：地图与吉祥物用 SVG 已能完整表达。

## 当前状态

已完成：

- 工程骨架、设计令牌、AntD 主题、字体子集加载、i18n 字典
- `/` 首页 —— 首屏真实地图切片 + 三步闭环 + 四档分层 + 内容体系
- `/learn` 学习地图 —— 从 `design/kid/map.html` 迁移为 React 组件
- `/learn/unit/:unitId` 单元学习 —— 四种题型，答题状态机，答错可重试
- `/learn/unit/:unitId/done` 结算 —— 星星逐颗落下
- `/parent` 学习周报 —— 三个数字 + G2 每日时长图 + 薄弱环节 + 单元掌握 + 明细表
- `/parent/plan`、`/parent/learners`、`/parent/settings`、`/parent/account` —— 占位页，导航可用
- 单元介绍弹层、暂停弹层、退出确认（均为焦点陷阱 + Esc 关闭）
- 1440×900 与 390×844 两个尺寸验证无横向溢出
- 完整流程已用真实浏览器跑通：地图 → 选关 → 6 题作答 → 结算

题型覆盖：

| 题型 | 状态 |
| --- | --- |
| `listen_choose_image` | ✅ 已实现 |
| `tap_to_read` | ✅ 已实现 |
| `read_choose` | ✅ 已实现 |
| `cloze` | ✅ 已实现 |
| `repeat_word` / `blend_sounds` / `business_scenario` | ⬜ 待 TTS 与组件 |

未完成（下一步）：

- `/trial` 体验课、`/courses`、`/pricing`、`/login` 首页通往页面
- 真实音频替换当前 SpeechSynthesis 兜底
- 图卡真实配图替换占位几何图
- 周报周切换与「去练一练」的跨端联动

## 内容生产链路（OU 工作流）

课程内容由 Dify 工作流「OU」生成，产出前端可直渲染的单元 JSON。
工作流：[`dify/OU.yml`](./dify/OU.yml)，说明：[`dify/README.md`](./dify/README.md)。

```
src/lib/
  types.ts            接口契约类型
  dify-adapter.ts     OU 产出 → 前端 Unit 的转换器
  sample-ou-course.json   OU 样例（kids-a 农场，第 4 关在用）
  sample-ou-teen.json     OU 样例（teen 校园）
  mock-data.ts        当前数据源，接后端时只换这里
```

接后端时**只改 `mock-data.ts`**：把 `getUnit` / `mockTodayProgress`
换成真实 API 调用即可，页面与组件一行不动。

## 关键实现约定

**答题状态机**（`features/learn/use-answer-machine.ts`）与界面解耦：

- 答错**不扣星、不判负**，允许无限重试；第二次答错给提示
- 星星按「一次答对」比例折算：全对 3 星、≥70% 2 星、其余 1 星
- 只有 `phase === 'correct'` 才锁卡片，保证答错后能重选
- 中途退出即丢弃本单元进度

## 待确认

- 第 4 点语言方案已定：**A 方案**（中文界面 + 英文内容），成人档后续加英文界面。
- 内容接入：古登堡公共领域文本需剥离 PG 头部尾部与全部商标提及后再入库。
- 音频：当前用浏览器 SpeechSynthesis 朗读，接 TTS 后替换 `PictureChoice` / `TapCard` 内的 `speak()`。
