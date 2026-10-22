# 图卡图片目录

前端按 `{word}.webp` 的命名在这里找图，文件不存在时自动回落到占位图。

## 怎么生成

```bash
cd web
export ZHIPU_API_KEY=...        # 或 DASHSCOPE_API_KEY / OPENAI_API_KEY
node scripts/gen-card-images.mjs --dry-run   # 先看会生成哪些
node scripts/gen-card-images.mjs             # 真正生成
```

脚本会从 `src/lib/sample-ou-*.json` 与 `mock-review.ts` 里收集所有出现过的
`imagePrompt`，按统一画风生成图片。

## 命名规则

`imagePrompt` 形如 `a cartoon cow, flat vector illustration, ...`
→ 取第一个逗号前、剥掉冠词与画风词、取最后一个实词 → `cow` → `cow.webp`

前端实现见 `src/lib/card-images.ts`，两边规则必须保持一致。

## 也可以手工放图

直接把图片命名为 `cow.webp` 放进本目录即可，不需要跑脚本。
建议 1024×1024、正方形、浅色背景，与现有界面协调。

## 为什么不进仓库

图片是可重新生成的二进制资源，体积大。已加进 `.gitignore`。
如果需要版本化（例如手工挑选过的图），删掉 `.gitignore` 里对应两行即可。
