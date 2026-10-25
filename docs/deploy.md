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
| 健康检查 | `https://你的域名/api/health` | `{"ok":true,"db":"postgresql",...}` |
| 首页 | `https://你的域名/` | 正常渲染 |
| 注册 | `https://你的域名/login?mode=signup` | 能建号并进入 `/learn` |
| 学习 | 进 `/learn` 完成一关 | 结算页显示星星 |
| 家长端 | `/parent` | 有数据 |

**重点看 `db` 字段**：必须是 `"postgresql"`。
如果显示 `"sqlite"`，说明 `DATABASE_URL` 没生效，数据会写到临时文件、重启即丢。

**必测的一条**：注销后重新登录，进度还在 —— 这证明数据真的落库了，
而不是只在浏览器内存里。

---

## 6. 首次部署后补的两件事

1. **设置站点域名**：Vercel 会给一个 `xxx.vercel.app` 地址。
   回到 Environment Variables 把 `NEXT_PUBLIC_SITE_URL` 填成该地址，
   然后 **Redeploy**（Deployments → 最新 → ⋯ → Redeploy）。
   不设置的话 sitemap.xml 与 canonical 里会是 localhost，影响 SEO。

2. **加可用性监控**：用 UptimeRobot 免费版每 5 分钟探测
   `https://你的域名/api/health`，非 200 就发邮件。
   详细步骤与告警配置见 [monitoring.md](./monitoring.md)。

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
| 构建失败：Node 版本不被支持 | 未声明 engines | 已声明 `engines.node >= 24`，若仍失败检查 Vercel 项目设置里的 Node 版本 |
| 页面打开但注册报 500 | 数据库表没建 | 执行第 4 步 `migrate deploy` |
| `Can't reach database server` | 连接串缺 `sslmode=require` | 补上参数 |
| `self-signed certificate` | 自建库用自签证书 | 连接串加 `?sslmode=no-verify`（明确表达意图），**不要**改代码 |
| 登录后刷新掉登录态 | `NEXT_PUBLIC_API_MODE` 还是 mock | 改成 `live` 后 Redeploy |
| 字体显示不统一 | 构建时字体子集没生成 | Vercel 没有 Python，字体会用系统字体回退；**不影响功能**，见下方说明 |
| 健康检查 `db` 显示 `sqlite` | `DATABASE_URL` 没生效 | 检查环境变量是否加到了正确的环境（Production） |
| 图片/音频 404 | 静态资源没提交 | 确认 `public/` 已进仓库 |

### 关于 Vercel 构建与字体子集

`npm run build` 会先跑 `scripts/ensure-fonts.mjs`，它需要 Python + fonttools 才能重建字体子集。

**Vercel 的构建环境没有 Python**，所以这一步会打印警告并跳过：
实际表现是「字体子集不重建，新文案里的生僻字回退到系统字体」。

- **不影响功能**，不影响布局，只是字形与其他字略不统一
- 想彻底解决：本地跑一次 `npm run build`（会重建子集），
  把更新后的 `public/fonts/*.woff2` 提交，Vercel 上就无需重建
- 已实测：伪造「字符集变化」并移除 python 后，脚本退出码仍为 0，**不会阻断构建**

### 关于静态资源体积

`public/` 约 9.9 MB（229 张图卡 + 115 个音频 + 字体），远低于 Vercel 免费层限制，
不需要拆分或上 CDN。


---

## 9. 回滚

Vercel → Deployments → 选上一个成功的版本 → **Promote to Production**。
数据库迁移不会自动回滚，若本次改动含 schema 变更，需要手动评估。

---

## 10. PostgreSQL 兼容性已验证

**不用只靠猜**：上线前已在真实 PostgreSQL 17 上跑过完整验证。

做法：本地起 `postgres:17-alpine` 容器，建独立测试库 `aotu_test`，
`.env` 指向它，然后执行生产同款命令与全部测试。

| 验证项 | 结果 |
| --- | --- |
| `prisma migrate deploy`（生产命令） | ✅ 15 张表全部创建 |
| 实际列类型 | ✅ `timestamp without time zone`（确认用的是 PG 版 DDL，非 SQLite） |
| 后端接口测试 | ✅ 36 + 13 + 18 全通过 |
| 浏览器端到端 | ✅ 18 全通过 |

**这一步抓到过一个会导致线上彻底挂掉的 bug**：

> Prisma 生成的 Client 与 schema 的 `provider` 是**编译期绑定**的。
> 早期设计用同一个 Client、运行时切换 adapter，会直接报
> `The Driver Adapter @prisma/adapter-pg is not compatible with the provider sqlite`，
> 表现为线上所有接口 500。

现在改为**生成两套 Client**（`prisma/generated` 与 `prisma/generated-pg`），
`src/lib/db.ts` 按连接串选择。`npm run db:generate` 会同时生成两套。

---

## 10.1 生产构建已验证（不只是 dev）

上线前用 `npm run build` + `npm run start`（生产模式）跑过完整验证：

| 验证项 | 结果 |
| --- | --- |
| 生产构建耗时 | 44.5 s（干净构建），远低于 Vercel 限制 |
| 生产产物体积 | server 35.3 MB + static 3.5 MB ≈ 39 MB |
| `public/` 静态资源 | 9.9 MB / 354 文件，无需 CDN |
| 生产模式下后端接口 | 36 + 13 + 18 项全通过 |
| 生产模式下全路由 | 22/22 通过 |
| 生产构建 + live 模式端到端 | 18/18 通过 |

**关键确认**：`NEXT_PUBLIC_API_MODE` 是**构建时内联**的，不是运行时读取。
生产构建里它被编译成 `void 0 !== t.default ? "live" : "mock"`，
实测在 `.env` 设为 `live` 后构建，注册确实发出 `POST /api/auth/login`，
说明内联生效。

> 由此得出一条部署纪律：**改 `NEXT_PUBLIC_*` 必须重新构建**，
> 只改环境变量然后重启是不够的。Vercel 上就是「改环境变量 → Redeploy」。

**排查提示**：如果怀疑前端没走真实后端，最可靠的验证方式是打开浏览器
DevTools 的 Network，看注册时有没有 `POST /api/auth/login`。
不要靠读构建产物猜——产物是压缩混淆的，容易误判（本项目就误判过一次）。

---

## 11. 上线后下一步（按价值排序）

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
- 两套 Client 由 `npm run db:generate` 生成（`build` / `postinstall` 自动执行）

**本地想验证 PG 行为时**（不用改线上环境）：

```bash
# 起一个本地 PG
docker run -d --name aotu-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=aotu_test -p 5432:5432 postgres:17-alpine

cd web
# 临时把 .env 的 DATABASE_URL 换成：
# postgresql://postgres:postgres@localhost:5432/aotu_test
npx prisma migrate deploy
npm run dev
# 验证完记得换回 file:./dev.db
```

> GitHub 仓库里还有另一个更老的后端设计（`aotuenglish` 库里有 23 张不同结构的表，
> 如 `LearnerUnitProgress`、`ReviewAnswer`）。那套与当前 schema 不兼容，
> **不要**把当前迁移指向那个库，否则会出现同名表冲突。用独立库（如 `aotu_test`）。

