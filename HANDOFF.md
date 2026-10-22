# AotuEnglish 项目总结与计划大纲

> 最后更新：2026-10-23
> 本文档是完整的项目状态快照，新会话从这里接手即可，无需翻历史。
> 配套文档：`docs/frontend-plan.md`（产品规划）、`web/README.md`（工程说明）

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
- 提交前必须跑 `npx tsc --noEmit` 和 `npm run build`
- 推送超时是常见网络波动，等 20 秒重试，不要改配置

---

## 一、项目是什么

一个**不限年龄**的英语学习网站。靠内容分层适配 4 岁到成人，而不是做多个产品。

- **学习者端**：一张看得见进度的学习地图，每过一关前进一格，答对立刻有回响
- **监护人端**：只讲事实的学习周报——时长、完成度、薄弱项，**没有排行榜，不公开比较**
- **核心循环**：今日任务 → 地图闯关 → 即时奖励 → 复习 → 家长周报

### 四档内容分层（产品地基）

| level | 年龄 | 界面密度 | 题量 | 吉祥物 |
| --- | --- | --- | --- | --- |
| `kids-a` | 4–7（首发主档） | 大图少字，触控 ≥200px | 6–8 | 有 |
| `kids-b` | 7–12 | 中图 + 短句 | 8–10 | 有 |
| `teen` | 13–16 | 文字为主 | 10–12 | 无 |
| `adult` | 17+ / 商务 | 信息密集 | 12–15 | 无 |

页面**不随年龄增删**，同一套路由靠 `level` 字段切密度。

---

## 二、当前进度

**17 个路由 + 1 个 API 接口，全部通过构建与真实浏览器验证。**

### 已完成页面

| 路由 | 内容 | 状态 |
| --- | --- | --- |
| `/` | 首页：首屏真实地图切片 + 三步闭环 + 四档分层 + 内容体系 | ✅ |
| `/trial` | 体验课：不注册直接玩第 1 题，玩完才留资 | ✅ |
| `/courses` | 课程体系：年龄 × 领域双筛选，9 门课覆盖四档 | ✅ |
| `/pricing` | 价格：三档方案 + 月付/年付切换（折扣按实价算） | ✅ |
| `/login` | 注册登录：双模式切换，完整表单校验 | ✅ |
| `/learn` | 学习地图：节点三态、路径描画、吉祥物、宝箱进度 | ✅ |
| `/learn/unit/[unitId]` | 单元学习：四种题型、答题状态机、答错无限重试 | ✅ |
| `/learn/unit/[unitId]/done` | 结算：星星逐颗落下 | ✅ |
| `/learn/words` | 词汇图卡：52 张真实配图，三档筛选，点卡发音 | ✅ |
| `/learn/review` | 复习：环形转盘 + 到期天数 + 复用答题机 | ✅ |
| `/learn/speak` | 跟读：按住录音 + Pts 声波 + 权限引导 | ✅ |
| `/learn/rewards` | 奖励：宝箱进度 + 徽章墙 + 装扮商店 | ✅ |
| `/parent` | 学习周报：三数字 + G2 图表 + 薄弱项 + 明细表 | ✅ |
| `/parent/plan` 等 4 个 | 占位页，导航可用 | ✅ |
| `/api/tts` | TTS 代理：百度主、有道兜底、内存缓存 | ✅ |

### 资源

| 类型 | 数量 | 体积 |
| --- | --- | --- |
| 图卡 | 52 张 JPG | 2.5 MB |
| 音频 | 52 个 MP3 | 890 KB |
| 源码 | 77 个文件 | — |

---

## 三、技术栈

| 层 | 选型 | 许可 |
| --- | --- | --- |
| 框架 | Next.js 16.4.2（App Router） | MIT |
| UI | React 19 + Ant Design 6.6.6 | MIT |
| 字体 | Baloo 2 / ZCOOL KuaiLe / Noto Sans SC | OFL-1.1 |
| 动效 | GSAP 3 + @gsap/react | Webflow 标准许可（非 MIT，商用免费） |
| 平滑滚动 | Lenis 1.3 | MIT |
| 图表 | @ant-design/charts 2.6（G2） | MIT |
| 2D Canvas | Pts 1.0.3 | Apache-2.0 |
| 3D | **不采用**（SVG 已足够） | — |

**架构**：营销页 SSR/预渲染，学习端与家长端客户端渲染。

---

## 四、内容生产链路

### 4.1 文字内容：OU 工作流（Dify）

```
web/dify/OU.yml          Dify 工作流
web/dify/README.md       用法与验证结论
```

**流程**：课程规划 → 单元循环（题目生成 → 审核修复）→ 汇总

**产出格式**：前端可直渲染的单元 JSON，含 `unitId / level / questions[]`

**已验证**（Python 实跑）：
- 畸形 JSON 容错 3 类：Markdown 围栏、前后解释文字、数组尾逗点
- 坏题拦截 3 类：缺 options、两个正确答案、非法题型
- 汇总节点 6 个边界：全正常/有失败/有修复/全失败/题数偏少/空输入

**未验证**：真实 LLM 调用（需 Dify 环境 + 智谱 Key）

**产不出的 3 个字段**（要后端补）：
- `Unit.index`（第几关）、`Unit.status`（进度）、`Option.imageUrl`（图片地址）

### 4.2 图卡：魔搭 Qwen-Image

```bash
cd web
export MODELSCOPE_API_KEY=...
node scripts/test-one-image.mjs cow          # 单张试跑
node scripts/gen-card-images.mjs --provider=modelscope --force
node scripts/gen-wordbank.mjs --minutes=9    # 从 101 词库批量生成
```

- 模型：`Qwen/Qwen-Image-2.1-Turbo`
- 异步任务制：POST 拿 task_id → GET 轮询
- `negative_prompt` 在生成阶段排除文字/水印（比智谱事后裁剪干净）

### 4.3 音频：百度/有道 + 本地化

```bash
node scripts/gen-audio.mjs        # 下载缺失的，自动更新清单
```

**三级降级**（`src/lib/speak.ts`）：
```
1. 本地音频 /audio/{word}.mp3    优先，零延迟、离线可用
2. 服务端代理 /api/tts           代理百度/有道，带缓存
3. 浏览器合成                    最终兜底
```

**为什么服务端代理**：百度/有道校验 Referer，浏览器直连会被 CORS 拦。

**合规提醒**：百度/有道是网页内部接口，非公开 API。**52 个音频已本地化，上线后不再调用**，风险很低。新词建议换 Azure（100 万字符/月免费）。

---

## 五、核心技术约定（改动前必读）

1. **UI 系统只有 AntD 一个**。学习端大画面是 AntD token + 自有组件，不是第二套系统。
2. **文案全部走 `src/i18n/index.ts`**，不写死中文。成人档切英文只需加字典。
3. **答题状态机在 `src/features/learn/use-answer-machine.ts`**，与界面解耦。
4. **答错不扣星、不判负**，无限重试；只有 `phase === 'correct'` 才锁卡片。
   （这条曾写错导致死锁，别改回去）
5. **设计令牌在 `src/design/tokens.ts`**，页面里不写十六进制。
6. **`unitId` 不能随便改**，它直接是路由参数。
7. **占位图哈希用整串 prompt**，不能用首字符——OU 的 prompt 都以 `a cartoon` 开头。
8. **主体颜色要显式写**（`COLOR_HINTS`），否则模型会把背景色染到主体上。
9. **抽象词要用场景描述**，否则会生成文字图，等于把答案写在图上。
10. **音频清单 `LOCAL_AUDIO`** 由脚本自动维护，避免无谓 404。

---

## 六、已知限制与技术债

### 高优先级（上线阻塞）

| 问题 | 说明 | 影响 |
| --- | --- | --- |
| **后端未接** | 全部数据在 `src/lib/mock-data.ts` | 无法真正上线 |
| **登录是模拟的** | `/login` 的 `onFinish` 里是 `setTimeout` | 无鉴权 |
| **支付未接** | `/pricing` 只有按钮 | 无法收费 |
| **跟读不打分** | 只录音不给分（没造假分数） | 需语音测评服务 |

### 中优先级

| 问题 | 说明 |
| --- | --- |
| 图卡背景有色差 | 10 张之间 rgb 184~237，尝试统一失败（会误伤白色主体） |
| 三种题型未实现 | `repeat_word`（要录音）、`blend_sounds`（要拼读音频）、`business_scenario` |
| 词库还剩 59 词 | 食物/身体/日常/交通/天气/动作 |
| `/learn/reading` 未做 | 分级读物 |
| 周切换未接 | `/parent` 的「本周/上周」是静态的 |

---

## 七、下一步计划

### 阶段一：补齐内容（1–2 天）

1. **生成剩余 59 个词**
   ```bash
   node scripts/gen-wordbank.mjs --minutes=9   # 分多次跑完
   node scripts/gen-audio.mjs                   # 同步下载音频
   ```
2. **补 `/learn/reading`** 分级读物页

### 阶段二：接入真实数据（3–5 天）

3. **设计 API 契约**（`docs/frontend-plan.md` §5.1 已有初稿）
4. **替换 `mock-data.ts`** 为真实请求
   - 页面与组件**一行不用改**，这是刻意设计的
5. **接真实鉴权**（`/login` 的 `onFinish`）
6. **接支付**（`/pricing`）

### 阶段三：产品化（1 周）

7. **接真实语音测评**（跟读打分）
8. **接 Azure TTS** 替换百度/有道（合规）
9. **性能优化**：图片转 WebP、字体子集化、路由预取
10. **SEO**：sitemap、结构化数据、OG 图

### 阶段四：上线（3–5 天）

11. 部署（Vercel / 自建）
12. 域名与 HTTPS
13. 监控与错误上报
14. 灰度测试

---

## 八、快速上手

```bash
cd F:\AotuEnglish\web
npm run dev          # http://localhost:3000
npx tsc --noEmit     # 类型检查
npm run build        # 生产构建
```

### 关键路径

```
F:\AotuEnglish\
├── HANDOFF.md                    本文件（项目总结）
├── docs\frontend-plan.md         产品规划（最完整）
├── design\kid\map.html           学习地图原始原型
└── web\
    ├── src\
    │   ├── app\                  17 个路由 + api\tts
    │   ├── design\               令牌 + AntD 主题
    │   ├── i18n\                 文案字典
    │   ├── components\           图标表、地图、导航、弹层
    │   ├── features\             learn / parent 功能组件
    │   └── lib\                  类型、mock、图卡解析、发音模块
    ├── public\cards\             52 张图卡
    ├── public\audio\             52 个音频
    ├── dify\                     OU 工作流
    ├── scripts\                  生图 / 生音频 / 词库
    └── shots\                    验证截图
```

---

## 九、验证方法（复用现有经验）

**不要只看截图**——很多 bug 只在真实交互中暴露。用 puppeteer 实测：

```javascript
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
});
```

**踩过的坑**：
- AntD 按钮文字是「登 录」（中间有空格），选择器要去空白
- 直接赋 `input.value` 不触发 React 更新，要用 `page.keyboard.type`
- 截图看起来被裁切可能只是无头模式渲染假象，用 `scrollWidth` 判断真实溢出
- 图片 404 时 `onError` 可能不触发，要检查 `naturalWidth` 兜底
- 热更新残留会导致 hydration 误报，清 `.next` 重启

---

## 十、当前状态一句话

**前端骨架完整可用（17 个路由、52 张图、52 个音频），核心学习闭环跑通；
后端、鉴权、支付、语音测评都还是模拟的，这是上线前的主要工作量。**
