# 监控与告警

> 目标：用**零成本**的方式，在网站挂了或数据库连不上时第一时间知道。

---

## 1. 健康检查接口

```
GET https://你的域名/api/health
```

| 情况 | 状态码 | 响应 |
| --- | --- | --- |
| 应用 + 数据库都正常 | `200` | `{ "ok": true, "db": "postgresql", "ms": 12, "time": "..." }` |
| 数据库连不上 | `503` | `{ "ok": false, "error": "database_unreachable" }` |

**设计取舍**（都是刻意为之）：

- **不返回业务数据**。早期版本返回了用户总数，任何人访问都能推断产品规模，
  改为只报告健康状态。
- **不返回详细错误**。Prisma 的报错里可能含连接串片段（含密码），
  公网接口只回粗粒度原因，详细日志留在服务端。
- **`Cache-Control: no-store`**。健康检查若被 CDN 缓存，监控会一直拿到旧结果，
  库挂了也发现不了。
- **探测用最轻量的查询**（`findFirst` 取一个 id），不做 count，避免大表扫描。

---

## 2. 外部可用性监控（免费，建议一定做）

用 **UptimeRobot**（免费版：50 个监控，5 分钟间隔）：

1. 注册 https://uptimerobot.com
2. **Add New Monitor**
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `AotuEnglish`
   - URL: `https://你的域名/api/health`
   - Monitoring Interval: `5 minutes`
3. 在 **Alert Contacts** 填邮箱，勾选接收告警

**建议再加一个告警条件**：在监控设置的 **Alert When** 里，
把「keyword not exists」设为 `"ok":true` —— 这样即使返回 200 但内容异常也能发现。

> 为什么至少 5 分钟一次：Vercel 免费层没有内置告警，而 UptimeRobot 免费版
> 的 5 分钟足够发现「网站挂了」这类问题。更细的粒度需要付费，暂时不值得。

---

## 3. 错误上报（可选，后期再做）

当前靠 **Vercel 自带的运行日志**（Dashboard → Logs）就能定位问题，含：

- 每个请求的状态码与耗时
- 服务端 `console.error` 输出
- 函数异常堆栈

**什么时候才需要接 Sentry**：

- 有真实用户、且开始收到「我这边报错了」的反馈却复现不了
- 需要按用户/版本聚合错误

现在接属于过度工程。真要做时：`npm i @sentry/nextjs`，按官方向导接入，
免费层每月 5000 个错误事件，够用很久。

---

## 4. 数据库侧关注点

Neon 免费层会自动休眠，需要注意：

| 现象 | 是否问题 | 说明 |
| --- | --- | --- |
| 闲置后首次请求慢 1–3 秒 | 正常 | Neon 冷启动，之后恢复 |
| `/api/health` 偶发 503 后自愈 | 需要关注 | 若频繁发生，说明连接池或额度有问题 |
| 存储接近 0.5 GB | 需要处理 | 本项目只有文字数据，正常使用远达不到 |

**查看用量**：Neon Dashboard → Project → Usage。

---

## 5. 上线后第一周要看的三个数

| 指标 | 在哪看 | 正常范围 |
| --- | --- | --- |
| 健康检查成功率 | UptimeRobot | 应接近 100% |
| 函数错误率 | Vercel → Observability | 应 < 1% |
| 响应耗时 p95 | Vercel → Observability | 应 < 1.5s（含 Neon 冷启动） |

若错误率异常升高，先查 **Vercel → Logs** 里最近 500 的请求，
最常见原因是 `DATABASE_URL` 失效或 Neon 额度用尽。

---

## 6. 本项目里的可观测性约定

写新接口时请遵守，方便排障：

1. **失败路径一律 `console.error('[模块名]', e)`**
   例：`console.error('[auth/login]', e)`
   这样在 Vercel 日志里可以直接按模块名过滤。

2. **不要吞掉异常**。要么返回明确错误码（契约 §1.1 格式），
   要么记录日志；两者都不做会让线上问题无从查起。

3. **错误响应统一格式**：
   ```json
   { "error": { "code": "UNAUTHORIZED", "message": "请先登录" } }
   ```

4. **公网接口不泄露内部细节**（堆栈、SQL、连接串）。
