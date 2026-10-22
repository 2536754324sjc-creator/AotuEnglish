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

**水印**：智谱免费模型 `cogview-3-flash` 会在右下角强制打「AI生成」水印。
脚本保存前会裁掉底部 9% 避开它。换付费模型后加 `--no-crop` 即可。

**抽象词**：`hello`、`red` 这类词直接生成会变成「文字图」，
等于在「听音选图」里把答案写在图上。脚本用 `SUBJECT_OVERRIDES`
把它们换成可见场景（hello → 挥手的孩子，red → 红色消防车）。

## 也可以手工放图

直接把图片命名为 `cow.jpg` 放进本目录即可。建议 1024×1024、正方形，
浅蓝背景（#cfe6f7）、扁平风格、深色描边，与现有 10 张保持统一。
