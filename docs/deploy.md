# 上线部署指南

> 目标：**成本最低地先上线**，确认效果后再优化服务器。
> 方案：Vercel（免费）+ Neon PostgreSQL（免费）。

---

## 0. 为什么选这套

| 项 | Vercel | 国内云服务器 |
| --- | --- | --- |
| 费用 | 免费层够用 | 约 60–100 元/月起 |
| 备案 | 不需要 | 需要（1–3 周） |
| 运维 | 零 | 自己配 Nginx/HTTPS/备份 |
| 国内访问 | 一般（可接受） | 快 |

**取舍**：先把产品跑起来验证需求，有真实用户再迁国内云。迁移动成本主要是数据库
（Neon 支持导出为标准 SQL）和域名，业务代码不用动。

---

## 1. 前置准备

- GitHub 仓库已推送最新代码（`master` 分支）
- 一个 GitHub 账号
- 一个邮箱（注册 Vercel 与 Neon）

---

## 2. 建数据库（Neon，约 5 分钟）

1. 打开 https://neon.tech 注册，创建项目
2. 区域选 **Singapore**（离国内最近，延迟最低）
3. 创建后在 Dashboard 找到 **Connection string**，形如：

   ```
   postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

4. **复制整串**，后面要用。

> Neon 免费层：0.5 GB 存储、每月约 190 小时计算。对本项目的文字数据完全够用。
> 闲置会自动休眠，第一次访问稍慢（约 1 秒），之后正常。

---

## 3. 建应用（Vercel，约 5 分钟）

1. 打开 https://vercel.com 用 GitHub 登录
2. **Add New → Project** → 选择 `AotuEnglish` 仓库
3. **关键配置**（这一步错了会构建失败）：

   | 项 | 值 |
   | --- | --- |
   | Framework Preset | Next.js |
   | **Root Directory** | **`web`** ← 必须改，本项目不是仓库根目录 |
   | Build Command | 保持默认（会走 `npm run build`） |
   | Output Directory | 保持默认 |

4. 展开 **Environment Variables**，添加：

   | Key | Value | 说明 |
   | --- | --- | --- |
   | `DATABASE_URL` | 第 2 步复制的连接串 | 必须带 `?sslmode=require` |
   | `NEXT_PUBLIC_API_MODE` | `live` | 走真实后端 |
   | `NEXT_PUBLIC_API_BASE` | `/api` | 同项目内置 API |
   | `NEXT_PUBLIC_SITE_URL` | 部署后的域名 | 先留空，首次部署后再补 |

5. 点 **Deploy**，等 2–4 分钟。

---

## 4. 首次部署后必须做（否则数据库是空的）

部署完成只说明代码跑起来了，**数据库表还没建**。在本地执行：

```bash
cd F:\AotuEnglish\web
```

临时把 `.env` 里的 `DATABASE_URL` 换成 Neon 的连接串，然后：

```bash
npx prisma migrate deploy
```

看到 `1 migration found` + `applied` 即可。**做完记得把 `.env` 换回本地 SQLite**：

```env
DATABASE_URL="file:./dev.db"
```

> 为什么不在 Vercel 构建时自动迁移：构建过程可能被重复执行或多实例并发，
> 自动迁移有把库改坏的风险。迁移应当是有意识的一次操作。

---

## 5. 验证上线是否成功

| 检查 | 地址 | 期望 |
| --- | --- | --- |
| 健康检查 | `https://你的域名/api/health` | `{"ok":true,"users":0,...}` |
| 首页 | `https://你的域名/` | 正常渲染 |
| 注册 | `https://你的域名/login?mode=signup` | 能建号并进入 `/learn` |
| 学习 | 进 `/learn` 完成一关 | 结算页显示星星 |
| 家长端 | `/parent` | 有数据 |

**必测的一条**：注销后重新登录，进度还在 —— 这证明数据真的落库了，
而不是只在浏览器内存里。

---

## 6. 首次部署后补的两件事

1. **设置站点域名**：Vercel 会给一个 `xxx.vercel.app` 地址。
   回到 Environment Variables 把 `NEXT_PUBLIC_SITE_URL` 填成该地址，
   然后 **Redeploy**（Deployments → 最新 → ⋯ → Redeploy）。
   不设置的话 sitemap.xml 与 canonical 里会是 localhost，影响 SEO。

2. **加一个监控**：用免费的外部检查服务（如 UptimeRobot）每分钟访问
   `https://你的域名/api/health`，非 200 就发邮件。这是最省事的可用性告警。

---

## 7. 绑定自己的域名（可选，需要一点钱）

1. 买域名（阿里云/Namesilo 等，约 50–100 元/年）
2. Vercel → Settings → Domains → 添加域名，按提示配 DNS
3. **不需要备案**——服务器不在国内

> 若以后迁到国内云服务器，才需要备案。

---

## 8. 常见问题

| 现象 | 原因 | 解决 |
| --- | --- | --- |
| 构建失败：找不到 `prisma` | `postinstall` 没跑 | 确认 Root Directory 是 `web` |
| 页面打开但注册报 500 | 数据库表没建 | 执行第 4 步 `migrate deploy` |
| `Can't reach database server` | 连接串缺 `sslmode=require` | 补上参数 |
| 登录后刷新掉登录态 | `NEXT_PUBLIC_API_MODE` 还是 mock | 改成 `live` 后 Redeploy |
| 字体显示不统一 | 构建时字体子集没生成 | 需要 Python + fonttools；缺了也不影响功能 |
| 图片/音频 404 | 静态资源没提交 | 确认 `public/` 已进仓库 |

---

## 9. 回滚

Vercel → Deployments → 选上一个成功的版本 → **Promote to Production**。
数据库迁移不会自动回滚，若本次改动含 schema 变更，需要手动评估。

---

## 10. 上线后下一步（按价值排序）

1. **接支付**（你之前要求放到最后）—— 需先定渠道
2. 跟读打分（需第三方语音测评服务的 Key）
3. TTS 换 Azure（现有的是网页内部接口，不保证稳定）
4. 内容管线：单元写入数据库，而不是硬编码在 `lib/server/units.ts`
5. 国内云迁移（若有真实用户且访问速度成为问题）

---

## 附：本机继续开发不受影响

上线配置与本地开发完全隔离：

- 本地 `.env` 保持 `DATABASE_URL="file:./dev.db"` + `NEXT_PUBLIC_API_MODE=mock`
- 线上用 Neon + `live`
- 两套 schema 由 `npm run schema:sync` 保持同步，`build` 时会自动校验
