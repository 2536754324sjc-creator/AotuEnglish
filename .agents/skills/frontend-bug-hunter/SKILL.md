---
name: frontend-bug-hunter
description: 检查前端代码是否有 BUG 时使用。适用于 React/Astro/TS/JS 项目的代码审查、改动复查（git diff）、bug 排查：系统性扫描常见前端缺陷模式，按严重程度输出文件行号、根因和修复建议。触发词：查 bug、找 bug、检查代码、code review、review、复查改动。
---

# 前端 Bug 猎手

系统性地在前端代码中找出**真 bug**：会崩溃、算错数、泄漏内存、产生竞态、引发安全问题、导致功能不work的缺陷。只报 bug，不报代码风格和偏好类问题（那些交给 linter 和格式化工具）。

## 工作流

1. **定范围**：本次检查什么——`git diff` 的改动、指定文件，还是全量代码。有 diff 时以 diff 为入口，但**必须跳出 diff 顺数据流和调用链看上下文**。
2. **按清单扫描**：先扫"关键路径"（认证授权、数据持久化、外部 API 调用、错误处理、计费/合规逻辑、用户输入校验、并发操作），再扫一般代码。
3. **根因追溯**：对每个疑似 bug，按五步往回追——症状出现在哪 → 直接原因是什么 → 调用链是谁传进来的 → 无效数据/状态最初从哪来 → 什么架构缺失让它得逞。**修在源头，而不是症状处。**
4. **分级输出**：按下方格式报告。
5. **给验证建议**：列出能证伪/证实该 bug 的命令或操作。**默认只报告不改代码**，用户明确要求修复时才改。

## 检查清单

### React（本项目 React 19 + Astro islands）

- **Hook 规则**：条件调用 hook、循环里调 hook、hook 顺序在早退 return 之后。
- **过期闭包 / 依赖缺失**：useEffect/useMemo/useCallback 依赖数组漏了实际用到的 state/props；定时器、addEventListener 回调里读到旧 state。
- **副作用未清理**：定时器、全局/3rd 方事件监听、ResizeObserver/MutationObserver/IntersectionObserver、WebSocket、EventSource、AbortController 未在 cleanup 中清理——内存泄漏和重复触发的头号来源。
- **异步竞态**：useEffect 里发请求无取消信号，组件卸载或 dep 变化后旧响应覆盖新数据；连续输入触发搜索时结果乱序。
- **setState 相关**：卸载后 setState（React 18+ 不报警但浪费）；直接修改 state 对象/数组后 setState 同一引用导致不渲染。
- **重渲染失控**：useEffect 依赖里写字面量对象/数组/函数导致无限循环；Context value 每次渲染新建对象引发整树重渲染；父组件传 inline 对象给 memo 组件使 memo 失效。
- **派生状态反模式**：用 state + useEffect 同步另一个 state，多源真相导致不同步；应直接派生或用 key 重置。
- **列表 key**：可重排/可删增列表用 index 作 key，导致状态错位、输入框内容串位。
- **受控/非受控切换**：input value 从 undefined 变有值或反之，触发 React 警告且光标行为异常。
- **ref 相关**：React 19 ref 作为 prop 的 cleanup 函数返回值；渲染期间读 ref.current。
- **Astro 水合**：SSR 与客户端渲染不一致的来源（Date、Math.random、localStorage、window 尺寸）；`client:` 指令选错（visible/load/idle）导致交互无效；传给 island 的 props 含函数/类实例无法序列化。
- **样式相关功能 bug**：fixed/absolute 元素被 overflow 容器裁剪；z-index 层叠导致遮罩盖不住/被盖；`pointer-events` 让元素点不到；移动端 100vh 被地址栏截断。

### JS/TS 通用

- **空值**：可能为 null/undefined 的直接属性访问、数组 [0] 未校验长度；用可选链 `?.` 掩盖本应处理的缺失数据。
- **相等与假值**：`==` 应为 `===`；`0`、`''`、`NaN`、`false` 作为 falsy 被误判("if (value)" 丢掉合法值)；`typeof x === 'object'` 没排除 null；`NaN !== NaN` 用 `Number.isNaN`。
- **数字与日期**：浮点直接比较（0.1+0.2）；`parseInt` 缺 radix；Date 本地时区与 UTC 混用导致差一天；`new Date(str)` 兼容性。
- **异常吞噬**：catch 里只 console.log 或静默 return 默认值，把错误伪装成正常数据。
- **Promise 误用**：未 floating promise 无 catch；`forEach`/`map` 里 async 不等待；`Promise.all` 一个失败全挂而无降级；async 函数返回值未包 Promise 的混用。
- **模块副作用**：循环依赖导致导入时为 undefined；顶层代码依赖执行顺序。

### 异步与数据请求

- fetch/请求无 `response.ok` 检查、无 try/catch、无超时；`res.json()` 对错误响应体解析失败二次抛错。
- 请求无加载/错误/空态处理；错误只 alert 或不处理。
- 重复提交无防重入保护；表单提交中按钮可重复点击。
- localStorage/sessionStorage 读写无 try/catch（隐私模式/超额抛异常）、无版本校验直接读旧结构数据。
- **本项目注意**：better-auth 会话失效路径（401 后是否静默失败）、D1/drizzle 查询错误冒泡到 UI、markdown 渲染（marked）未消毒即 `dangerouslySetInnerHTML`——XSS，属于 P0。

### Vue（若项目中使用）

- props 解构丢失响应式（Vue 3.4+ 注意 props destructure）；`v-for` 缺 key 或用 index；`watch` 缺 immediate/deep 导致不触发；依赖 nextTick 的 DOM 测量时机。

### 安全即功能

- 用户输入未消毒进入 HTML/URL/命令；`eval`/`new Function`；`target="_blank"` 缺 `rel="noopener"`；敏感信息进日志/前端存储。

## 严重程度分级

| 级别 | 定义 | 例 |
|---|---|---|
| **P0** | 崩溃、数据丢失、安全漏洞、主流程不可用 | XSS、请求裸奔致白屏、状态错乱丢数据 |
| **P1** | 功能错误、竞态、内存泄漏、边界失效 | 清理缺失、竞态覆盖、假值误判 |
| **P2** | 隐患与边界，当前难触发但会恶化 | 缺 radix、未校验的边界输入 |

## 输出格式

每个发现：

```
### [P1] 标题：一句话说清这是什么 bug
- 位置：src/components/Foo.tsx:42（如适用附调用链）
- 问题：现象 + 为什么这是 bug（触发条件）
- 根因：五步追溯的结论——无效数据/状态从哪来、哪层缺失放过它
- 修复：源头 + 沿途各层的防御建议
```

全部报告后附一节 **验证建议**：可运行的命令（如 `npm run typecheck`、`npm run test`、`npm run build`）或手动复现步骤。若未发现问题，明确说明扫描了哪些文件、覆盖了清单哪些项、哪些没覆盖——不许用"未发现明显问题"糊弄。

## 边界

- 只读分析，不改代码，除非用户明确要求修复。
- 每条发现必须带 `文件:行号`；读不到行号的说明依据。
- 不确定的标 **[疑似]** 并说明缺什么信息才能确认。
- 区分"确定的 bug"与"可疑模式"，不许把风格问题升级成 bug。
