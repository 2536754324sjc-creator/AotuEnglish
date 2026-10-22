# 图卡图片目录

前端按 `{word}.jpg` 的命名在这里找图，文件不存在时自动回落到占位图。

## 当前状态

10 张图已生成并提交进仓库（共约 600 KB）：

```
apple  car  chair  cow  hello  pencil  pig  red  sheep  table
```

## 怎么生成

```bash
cd web
export ZHIPU_API_KEY=...        # 或 DASHSCOPE_API_KEY / OPENAI_API_KEY
node scripts/gen-card-images.mjs --dry-run   # 先看会生成哪些，不调 API
node scripts/gen-card-images.mjs             # 生成缺失的
node scripts/gen-card-images.mjs --force     # 全部重新生成
```

脚本会从 `src/lib/sample-ou-*.json` 与 `mock-review.ts` 里收集所有出现过的
`imagePrompt`，按统一画风生成。

## 命名规则

`imagePrompt` 形如 `a cartoon cow, flat vector illustration, ...`
→ 取第一个逗号前、剥掉冠词与画风词、取最后一个实词 → `cow` → `cow.jpg`

前端实现见 `src/lib/card-images.ts`，两边规则必须保持一致。

## 两个已处理的问题

**水印**：智谱免费模型 `cogview-3-flash` 会在右下角强制打「AI生成」水印。
脚本保存前会裁掉底部 9% 避开它。换付费模型后加 `--no-crop` 即可。

**抽象词**：`hello`、`red` 这类词直接生成会变成「文字图」，
等于在「听音选图」里把答案写在图上。脚本用 `SUBJECT_OVERRIDES`
把它们换成可见场景（hello → 挥手的孩子，red → 红色消防车）。

## 也可以手工放图

直接把图片命名为 `cow.jpg` 放进本目录即可。建议 1024×1024、正方形，
浅蓝背景（#cfe6f7）、扁平风格、深色描边，与现有 10 张保持统一。
