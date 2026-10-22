# 图卡图片目录

前端按 `{word}.jpg` 的命名在这里找图，文件不存在时自动回落到占位图。

## 当前状态

10 张图已生成并提交进仓库（共约 600 KB）：

```
apple  car  chair  cow  hello  pencil  pig  red  sheep  table
```

## 怎么生成

### 推荐：魔搭 ModelScope（Qwen-Image-2.1-Turbo）

```bash
cd web
export MODELSCOPE_API_KEY=...      # https://modelscope.cn/my/myaccesstoken

# 先试一张，确认画风（只花 1 次调用）
node scripts/test-one-image.mjs cow

# 满意后批量生成
node scripts/gen-card-images.mjs --provider=modelscope --force
```

魔搭的优势：支持 `negative_prompt`，能在**生成阶段就排除文字和水印**，
不用像智谱那样事后裁图。模型 ID 是 `Qwen/Qwen-Image-2.1-Turbo`。

**前提**：账号需绑定阿里云并完成实名认证，否则 API-Inference 不可用。

### 备选：智谱 CogView

```bash
export ZHIPU_API_KEY=...
node scripts/gen-card-images.mjs --force
```

免费模型 `cogview-3-flash` 会在右下角强制打「AI生成」水印，
脚本会自动裁掉底部 9% 避开。

### 两个脚本的分工

| 脚本 | 用途 |
| --- | --- |
| `test-one-image.mjs <word>` | 单张试跑，产物写 `_test-{word}.jpg`，不覆盖正式图 |
| `gen-card-images.mjs` | 批量生成，写 `{word}.jpg` |

## 命名规则

`imagePrompt` 形如 `a cartoon cow, flat vector illustration, ...`
→ 取第一个逗号前、剥掉冠词与画风词、取最后一个实词 → `cow` → `cow.jpg`

前端实现见 `src/lib/card-images.ts`，两边规则必须保持一致。

## 两个已处理的问题

**抽象词会变成文字图**：`hello`、`red` 直接生成会画成「文字」，
等于在「听音选图」里把答案写在图上。脚本用 `SUBJECT_OVERRIDES`
换成可见场景（hello → 挥手的孩子，red → 红色消防车）。

**主体被背景色染色**：只写 `a single cow` + 浅蓝背景时，
模型会把背景蓝染到主体上，生成一头蓝色的牛。
脚本用 `COLOR_HINTS` 显式写清自然色（cow → black and white dairy cow）。

## 已知限制

**背景色不统一**：10 张图的背景在 rgb(184,215,240) 到 rgb(237,255,255) 之间浮动，
都是浅色但有色差。尝试过用脚本统一背景色，但**放弃了**：
白色主体（奶牛的白斑、绵羊的白毛）与浅色背景太接近，
基于颜色距离的替换会误伤主体，把白牛变成蓝牛。

实际页面里每张图嵌在白色卡片内、四周有留白，色差并不明显。
如果将来需要严格统一，应该用「生成时锁定 seed + 更强 prompt」或
「AI 抠图后重新合成背景」，而不是简单的颜色替换。

## 也可以手工放图

直接把图片命名为 `cow.jpg` 放进本目录即可。建议 1024×1024、正方形，
浅蓝背景、扁平风格、深色描边，与现有 10 张保持统一。
