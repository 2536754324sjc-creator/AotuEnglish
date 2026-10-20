# OU · Dify 工作流

AotuEnglish 的课程内容生产工作流。基于 `deepseek增加听写完整工作流` 改造而来，
把原来面向「句游英语」听写格式的输出，改成**前端能直接渲染的单元 JSON**。

文件：[`OU.yml`](./OU.yml)

## 它产出什么

跑完一次，得到一个 JSON：

```jsonc
{
  "courseName": "农场英语启蒙",
  "description": "面向 4-7 岁，围绕农场动物展开的入门课程",
  "level": "kids-a",
  "reviewStatus": "pass",          // pass | partial | fail
  "units": [
    {
      "unitId": "kids-a-farm-01",
      "level": "kids-a",
      "topic": "Farm Animals",
      "titleZh": "农场动物",
      "wordCount": 3,
      "estMinutes": 5,
      "reviewStatus": "pass",
      "questionCount": 2,
      "questions": [
        {
          "id": "kids-a-farm-01-q1",
          "type": "listen_choose_image",
          "promptZh": "听一听，选出正确的图",
          "audioText": "cow",
          "options": [
            { "id": "a", "imagePrompt": "a cartoon cow, flat vector illustration, soft sky blue background", "correct": true },
            { "id": "b", "imagePrompt": "a cartoon car, flat vector illustration, soft sky blue background", "correct": false }
          ]
        }
      ]
    }
  ]
}
```

这个形状**逐字段对应**前端 `src/lib/types.ts` 里的 `Unit` / `Question` / `Option`。

## 输入参数

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `level` | 是 | 内容档：`kids-a` / `kids-b` / `teen` / `adult`（下拉选择） |
| `topic` | 是 | 课程主题，如 `farm animals` |
| `units` | 否 | 期望单元数；空则按档位默认（kids-a 5、kids-b 6、teen 6、adult 8） |
| `goals` | 否 | 学习目标 |

## 流程

```
开始（level / topic / units / goals）
  │
  ├─ 课程规划（LLM）        → 规划出单元框架 + 每单元词表 + 干扰词
  │    └─ 规划解析（Code）  → 校验 unitId / words / distractors
  │
  └─ 单元循环（Iteration，逐单元并行）
       ├─ 题目生成（LLM）      → 按词表出题
       ├─ 题目解析（Code）    → 校验题型枚举、恰好一个正确答案、id 重编号
       ├─ 题目审核+修复（LLM） → 审结构/题量/词表覆盖，有问题直接修
       └─ 单元结果（Code）    → 组装单元对象
  │
  └─ 汇总输出（Code）       → lesson_json / units_json / stats / warnings
```

## 相比原工作流的改动

| 环节 | 原来 | 现在 |
| --- | --- | --- |
| 输入 | `age` / `level` / `topic` / `goals` | `level`（四档下拉）/ `topic` / `units` / `goals` |
| 课程规划 | 通用年龄水平，产出 `unit_id`/`vocabulary_count` | 四档分层，**同时产出每单元词表与干扰词** |
| 内容生产 | 词汇/短语/例句/语法/练习五类教学内容 | **直接产出题目**（题型 + 选项 + 正确答案） |
| 审核 | 审五类内容 | 审题目结构：题型合法、唯一正确答案、词表全覆盖、id 连续 |
| 输出 | `lesson_json`（句游听写格式，含 `structure` 语法拆解） | `lesson_json`（前端 Unit 格式）+ `units_json` + `stats` + `warnings` |

**保留的部分**：整体骨架（规划 → 循环 → 审核 → 汇总）、JSON 容错解析、
迭代并行、失败单元跳过与统计。

## 题型覆盖

| 题型 | OU 会产出 | 前端组件 | 状态 |
| --- | --- | --- | --- |
| `listen_choose_image` | ✅ | `PictureChoice` | ✅ 已实现 |
| `tap_to_read` | ✅ | `TapCard` | ✅ 已实现 |
| `read_choose` | ✅（kids-b 起） | `TextChoice` | ✅ 已实现 |
| `cloze` | ✅（teen / adult） | `TextChoice` | ✅ 已实现 |
| `repeat_word` | ❌ | 待做 | 需要录音，接 TTS 后补 |
| `blend_sounds` | ❌ | 待做 | 需要拼读音频切分 |
| `business_scenario` | ❌ | 待做 | 商务场景对话 |

前四种已能产出、前端也能渲染，链路完整。后三种等前端组件做好后再加进工作流的题型枚举。

## 两个必须知道的字段缺口

跑完工作流后，前端拿到的单元**还缺三个字段**，需要后端补：

| 字段 | 谁补 | 说明 |
| --- | --- | --- |
| `index` | 后端 | 第几关，按课程内顺序编号 |
| `status` | 后端 | `done` / `current` / `locked`，按学习者进度算 |
| `option.imageUrl` | 后端 | 工作流只给 `imagePrompt`，需调图库生成后回填 URL |

前端已有兜底：`imageUrl` 为空时用几何占位图，不会白屏。

## 怎么用

1. 打开 Dify → 导入 `OU.yml`
2. 确认模型：当前配的是 `glm-4.5-flash`（智谱）。要换模型，在三个 LLM 节点里改 `model.name` 与 `provider`
3. 填 `level` / `topic`，跑
4. 拿 `lesson_json` 的内容，补上 `index` / `status` / `imageUrl` 后入库
5. 看 `warnings`：修复过的单元建议人工抽查

## 已验证

**Python 实跑 Code 节点**（4 个节点全部 `exec()` 执行，非代码审阅）：

- `parse_plan` 校验 `unitId` / `words` / `distractors` 缺失
- `parse_content` 畸形输出容错三类全通过：Markdown 围栏、前后解释文字、数组尾逗点
- `parse_content` 坏题拦截三类全通过：缺 `options`、两个正确答案、非法题型
- `parse_final` 状态处理：`pass` → `reviewStatus=pass` 且 errors 清空；
  `fail` → `reviewStatus=repaired` 且 errors 保留
- `code_aggregate` 6 个边界：全正常 → `pass`；有失败 → `partial` + warnings；
  有修复 → `partial` + 建议抽查；全失败 → `fail`；题数偏少 → 提示；空输入 → `fail`
- 最终 JSON 字段与 `src/lib/types.ts` 逐项对照无缺漏

**前端用真实产出走通**：

- `sample-ou-course.json`（kids-a 农场）→ 第 4 关 6 题全程走完到结算
- `sample-ou-teen.json`（teen 校园）→ `read_choose` 与 `cloze` 均正确渲染
- 坏数据兜底：缺选项字段为 `undefined` 不崩；未支持题型走兜底提示；
  不存在的单元显示「找不到这一关 + 回到学习地图」，无控制台错误

## 未验证

**真实 LLM 调用** —— 需要 Dify 环境 + 智谱 API Key，本机两者都没有，无法离线复现。

导入 Dify 后请先跑一次 `kids-a` + `farm animals`，重点看两件事：

1. `warnings` 字段是否为空或仅含已知提示 —— 如果这里出现大量「题数偏少」，
   说明 LLM 没按题量配比出题，需要调 `llm_content` 的提示词或降低一次生成的题量。
2. 三个 LLM 节点里 `structured_output.enabled` 若可打开，建议打开 ——
   当前是关闭状态，靠容错解析兜底；打开后 JSON 合法率会显著提高。
