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

**17 个路由 + 1 个 API 接口全部完成**，资源齐备（52 张图卡 + 52 个音频）。

已完成页面：

| 路由 | 内容 |
| --- | --- |
| `/` | 首页：真实地图切片 + 三步闭环 + 四档分层 + 内容体系 |
| `/trial` | 体验课：不注册直接玩，玩完才留资 |
| `/courses` | 课程体系：年龄 × 领域双筛选 |
| `/pricing` | 价格：三档方案 + 月付/年付切换 |
| `/login` | 注册登录：双模式 + 完整表单校验 |
| `/learn` | 学习地图：节点三态、路径描画、吉祥物、宝箱进度 |
| `/learn/unit/:unitId` | 单元学习：四种题型、答题状态机、答错无限重试 |
| `/learn/unit/:unitId/done` | 结算：星星逐颗落下 |
| `/learn/words` | 词汇图卡：52 张真实配图、三档筛选、点卡发音 |
| `/learn/review` | 复习：环形转盘 + 到期天数 |
| `/learn/speak` | 跟读：按住录音 + Pts 声波 + 权限引导 |
| `/learn/rewards` | 奖励：宝箱 + 徽章墙 + 装扮商店 |
| `/parent` | 学习周报：三数字 + G2 图表 + 薄弱项 + 明细表 |
| `/parent/*` 4 个 | 占位页，导航可用 |

API：`/api/tts` —— 百度主、有道兜底、内存缓存。

题型覆盖：

| 题型 | 状态 |
| --- | --- |
| `listen_choose_image` / `tap_to_read` / `read_choose` / `cloze` | ✅ 已实现 |
| `repeat_word` / `blend_sounds` / `business_scenario` | ⬜ 待做 |

未完成：

- `/learn/reading` 分级读物页
- 后端接入（数据全在 `mock-data.ts`）
- 真实鉴权与支付
- 语音测评（跟读只录音不打分）

## 资源

| 类型 | 数量 | 体积 | 生成方式 |
| --- | --- | --- | --- |
| 图卡 | 52 张 JPG | 2.5 MB | `scripts/gen-card-images.mjs` / `gen-wordbank.mjs` |
| 音频 | 52 个 MP3 | 890 KB | `scripts/gen-audio.mjs` |

## 发音模块（`src/lib/speak.ts`）

三级降级，5 个组件共用：

```
1. 本地音频 /audio/{word}.mp3    优先，零延迟、离线可用
2. 服务端代理 /api/tts           代理百度/有道，带缓存
3. 浏览器合成                    最终兜底
```

本地音频只对 `LOCAL_AUDIO` 清单里的词生效，避免无谓 404。

## 内容生产链路

### 文字：Dify 工作流「OU」

```
dify/OU.yml         工作流
dify/README.md      用法与验证结论
```

产出前端可直渲染的单元 JSON。接后端时**只改 `mock-data.ts`**，
页面与组件一行不动。

### 图卡与音频

```bash
export MODELSCOPE_API_KEY=...
node scripts/test-one-image.mjs cow              # 单张试跑
node scripts/gen-card-images.mjs --provider=modelscope --force
node scripts/gen-wordbank.mjs --minutes=9        # 批量（101 词库）
node scripts/gen-audio.mjs                       # 下载音频并更新清单
```

## 关键实现约定

**答题状态机**（`features/learn/use-answer-machine.ts`）与界面解耦：

- 答错**不扣星、不判负**，允许无限重试；第二次答错给提示
- 星星按「一次答对」比例折算：全对 3 星、≥70% 2 星、其余 1 星
- 只有 `phase === 'correct'` 才锁卡片，保证答错后能重选
- 中途退出即丢弃本单元进度

## 已知限制

- 图卡背景色有轻微色差（rgb 184~237），统一失败过——会误伤白色主体
- 百度/有道是网页内部接口，非公开 API；52 个音频已本地化，上线后不再调用
- 跟读只录音不打分，需接入语音测评服务
