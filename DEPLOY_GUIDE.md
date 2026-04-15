# Qiora 部署指南

从零到上线，按顺序走完即可。每个步骤都标注了预计耗时。

---

## 目录

1. [本地环境准备](#1-本地环境准备)（10 分钟）
2. [Supabase 项目创建](#2-supabase-项目创建)（15 分钟）
3. [数据库初始化](#3-数据库初始化)（10 分钟）
4. [Google OAuth 配置](#4-google-oauth-配置)（15 分钟）
5. [Stripe 配置](#5-stripe-配置)（20 分钟）
6. [Anthropic API 配置](#6-anthropic-api-配置)（5 分钟）
7. [本地运行验证](#7-本地运行验证)（10 分钟）
8. [Git 仓库初始化](#8-git-仓库初始化)（5 分钟）
9. [Vercel 部署](#9-vercel-部署)（15 分钟）
10. [Stripe Webhook 生产配置](#10-stripe-webhook-生产配置)（10 分钟）
11. [域名绑定](#11-域名绑定)（10 分钟）
12. [上线后验证清单](#12-上线后验证清单)
13. [常见问题](#13-常见问题)

总计约 **2 小时**。

---

## 1. 本地环境准备

### 前置要求

```bash
# 确认已安装（版本不低于括号内的数字）
node --version    # v18+（你现在是 v25，OK）
pnpm --version    # v8+（你现在是 v10，OK）
git --version     # 任意版本
```

如果缺 pnpm：
```bash
npm install -g pnpm
```

### 安装依赖

```bash
cd /Users/caochao/Documents/future_fortune/Qiora
pnpm install
```

### 创建环境变量文件

```bash
cp .env.example apps/web/.env.local
```

后续步骤会逐个填入 `.env.local` 的值。

---

## 2. Supabase 项目创建

### 2.1 注册/登录

打开 https://supabase.com → Sign Up（或用 GitHub 登录）

### 2.2 新建项目

1. 点击 **New Project**
2. 填写：
   - **Name**: `qiorazen` 或 `qiorazen-prod`
   - **Database Password**: 生成一个强密码 → **记下来**，后面要用
   - **Region**: 选 `US East (N. Virginia)` — 离目标用户最近
   - **Plan**: Free 够开发用，上线后升级 Pro ($25/月)
3. 等待项目初始化完成（约 1–2 分钟）

### 2.3 获取 Keys

项目创建完成后：

1. 左侧菜单 → **Project Settings** (齿轮图标) → **API**
2. 找到以下三个值，填入 `apps/web/.env.local`：

```env
# Project URL — 在 "Project URL" 区域
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# anon public key — 在 "Project API keys" 区域，标签是 "anon" "public"
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# service_role key — 同一区域，标签是 "service_role" "secret"
# ⚠️ 这个 key 有管理员权限，永远不要暴露到前端或提交到 Git
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

---

## 3. 数据库初始化

### 3.1 执行迁移

1. Supabase Dashboard → 左侧菜单 → **SQL Editor**
2. 按以下顺序，**每个文件单独执行**（点 Run 按钮）：

| 顺序 | 文件 | 说明 |
|------|------|------|
| 1 | `packages/db/migrations/001_profiles.sql` | 用户 profile + 自动创建触发器 |
| 2 | `packages/db/migrations/002_screening_sessions.sql` | 测评问卷记录 |
| 3 | `packages/db/migrations/003_consent_records.sql` | 用户同意记录 |
| 4 | `packages/db/migrations/004_tongue_images.sql` | 舌象图片 |
| 5 | `packages/db/migrations/005_practitioners.sql` | 从业者/专家 |
| 6 | `packages/db/migrations/006_insight_requests.sql` | 咨询请求（核心表） |
| 7 | `packages/db/migrations/007_subscriptions.sql` | 订阅 + 支付记录 |

**操作方法**：
- 打开对应 `.sql` 文件，全选复制内容
- 粘贴到 SQL Editor
- 点击 **Run** → 看到 `Success. No rows returned` 即为成功
- 如果报错，看错误信息 — 大概率是顺序不对（有外键依赖）

### 3.2 验证表已创建

SQL Editor 执行：

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

应该看到 8 张表：
```
consent_records
insight_requests
payments
practitioners
profiles
screening_sessions
subscriptions
tongue_images
```

### 3.3 创建 Storage Bucket

1. 左侧菜单 → **Storage**
2. 点击 **New Bucket**
3. 填写：
   - **Name**: `tongue-images`
   - **Public**: **关闭**（Private bucket）
   - **File size limit**: `5MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
4. 点击 **Create bucket**

### 3.4 设置 Storage RLS 策略

在 Storage 页面点击 `tongue-images` bucket → **Policies** 标签 → **New Policy** → **Custom**：

**上传策略**：
```sql
-- Policy name: Users upload own images
-- Allowed operation: INSERT
CREATE POLICY "Users upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tongue-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**读取策略**：
```sql
-- Policy name: Users read own images
-- Allowed operation: SELECT
CREATE POLICY "Users read own images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'tongue-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**删除策略**：
```sql
-- Policy name: Users delete own images
-- Allowed operation: DELETE
CREATE POLICY "Users delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tongue-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 4. Google OAuth 配置

让用户能用 Google 账号一键登录。

### 4.1 Google Cloud Console

1. 打开 https://console.cloud.google.com
2. 创建新项目（或选已有项目）
3. 左侧菜单 → **APIs & Services** → **OAuth consent screen**
   - User Type: **External**
   - App name: `Qiora`
   - Support email: 你的邮箱
   - Authorized domains: 先留空（部署后补填）
   - 点 Save，后续步骤全部默认
4. 左侧菜单 → **Credentials** → **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Qiorazen Web`
   - Authorized redirect URIs 添加：
     ```
     https://xxxxx.supabase.co/auth/v1/callback
     ```
     （把 `xxxxx` 替换成你的 Supabase 项目 URL）
   - 本地开发再加一条：
     ```
     http://localhost:3000/api/auth/callback
     ```
5. 创建后会显示 **Client ID** 和 **Client Secret** → 复制保存

### 4.2 在 Supabase 启用 Google Provider

1. Supabase Dashboard → **Authentication** → **Providers**
2. 找到 **Google** → 展开 → 开启
3. 填入：
   - **Client ID**: 上一步拿到的
   - **Client Secret**: 上一步拿到的
4. 点 **Save**

### 4.3 验证

此时本地可以测试 Google 登录了（等第 7 步本地运行时验证）。

---

## 5. Stripe 配置

### 5.1 注册 Stripe

1. 打开 https://stripe.com → 注册账号
2. 注册完后默认在 **Test Mode**（页面右上角开关）
3. **先用 Test Mode 完成所有配置和测试，上线前再切换到 Live Mode**

### 5.2 获取 API Keys

1. Stripe Dashboard → **Developers** → **API keys**
2. 填入 `apps/web/.env.local`：

```env
# Publishable key（以 pk_test_ 开头）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Secret key（以 sk_test_ 开头）
STRIPE_SECRET_KEY=sk_test_...
```

### 5.3 创建产品和价格

在 Stripe Dashboard → **Product catalog** → **Add product**：

| 产品名称 | 价格 | 类型 | 填入 .env 的 key |
|---------|------|------|-----------------|
| Deeper Insight (AI Only) | $19.00 | One time | `STRIPE_PRICE_BASIC` |
| Expert Insight (AI + Practitioner) | $39.00 | One time | `STRIPE_PRICE_PRACT` |
| Monthly Basic | $99.00/month | Recurring | `STRIPE_PRICE_SUB_BASIC` |
| Monthly Premium | $199.00/month | Recurring | `STRIPE_PRICE_SUB_PREM` |

创建每个产品后，点进去 → **Pricing** 区域 → 复制 Price ID（以 `price_` 开头），填入对应的 `.env.local` 变量。

### 5.4 本地 Webhook 测试（开发时用）

```bash
# 安装 Stripe CLI
brew install stripe/stripe-cli/stripe

# 登录
stripe login

# 转发 webhook 到本地
stripe listen --forward-to localhost:3000/api/payments/webhook
```

运行后会显示一个 webhook signing secret（以 `whsec_` 开头），填入：

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

> 注意：每次运行 `stripe listen` 会生成新的 secret，开发时保持终端开着就行。
> 生产环境的 webhook secret 在第 10 步配置。

---

## 6. Anthropic API 配置

1. 打开 https://console.anthropic.com
2. 注册/登录
3. 左侧 → **API Keys** → **Create Key**
4. 复制 key，填入 `apps/web/.env.local`：

```env
ANTHROPIC_API_KEY=sk-ant-...
```

> 新账号有 $5 免费额度，够测试用。正式上线前需要充值或绑定信用卡。
> Claude Sonnet 每百万 token 约 $3 输入 / $15 输出，每次咨询约 $0.02–0.05。

---

## 7. 本地运行验证

### 7.1 确认 .env.local

检查 `apps/web/.env.local` 现在应该长这样（所有值都已填入）：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_BASIC=price_...
STRIPE_PRICE_PRACT=price_...
STRIPE_PRICE_SUB_BASIC=price_...
STRIPE_PRICE_SUB_PREM=price_...

ANTHROPIC_API_KEY=sk-ant-...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7.2 启动开发服务器

```bash
cd /Users/caochao/Documents/future_fortune/Qiora
pnpm dev
```

打开 http://localhost:3000 ，你应该看到：

### 7.3 逐项验证

| # | 测试项 | 怎么做 | 预期结果 |
|---|-------|--------|---------|
| 1 | 首页加载 | 打开 `localhost:3000` | 看到 "发现您的养生体质" 标题 |
| 2 | 语言切换 | 点击头部 "EN" 按钮 | 页面切换为英文 |
| 3 | 免费测评 | 点击 "开始免费测评" → 回答 8 个问题 | 看到体质雷达图 + 养生建议 |
| 4 | 登录页 | 点击 "登录" | 看到邮箱输入框 + Google 登录按钮 |
| 5 | Magic Link | 输入邮箱 → 提交 | 收到登录邮件（检查垃圾邮件） |
| 6 | Google 登录 | 点击 "Continue with Google" | 跳转 Google → 授权 → 回到 Dashboard |
| 7 | 免责声明 | 每个页面底部 | 都显示养生免责声明文字 |

> **如果第 5 步收不到邮件**：Supabase Free 计划每小时限制 4 封邮件。可以在 Supabase Dashboard → Authentication → Users 里手动确认用户。

### 7.4 验证数据库连接

完成一次测评后，去 Supabase Dashboard → **Table Editor** → `screening_sessions`，应该能看到刚才的测评记录。

---

## 8. Git 仓库初始化

```bash
cd /Users/caochao/Documents/future_fortune/Qiora

git init
git add .
git commit -m "feat: Qiora MVP Sprint 1 — monorepo, TCM engine, screening, auth, i18n"
```

### 推送到 GitHub（可选但推荐）

```bash
# 在 GitHub 上创建空仓库（不要勾选 README/gitignore）
# 然后：
git remote add origin git@github.com:你的用户名/qiorazen.git
git branch -M main
git push -u origin main
```

> **安全提醒**：`.env.local` 已被 `.gitignore` 忽略，不会被提交。确认 `git status` 里没有 `.env` 文件。

---

## 9. Vercel 部署

### 9.1 连接 Vercel

1. 打开 https://vercel.com → 用 GitHub 登录
2. 点击 **Add New** → **Project**
3. 选择刚才推送的 `qiorazen` 仓库 → **Import**

### 9.2 配置构建设置

Vercel 会自动检测到 Turborepo，但需要手动确认以下设置：

| 设置项 | 值 |
|--------|------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/web` |
| **Build Command** | `cd ../.. && pnpm build --filter=@qiorazen/web` |
| **Output Directory** | `.next` |
| **Install Command** | `pnpm install` |

> **如果 Vercel 没有自动识别 monorepo**：在 Root Directory 填 `apps/web`，Build Command 填 `cd ../.. && pnpm build --filter=@qiorazen/web`。

### 9.3 配置环境变量

在 Vercel 的 **Environment Variables** 区域，添加所有变量：

```
NEXT_PUBLIC_SUPABASE_URL        = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJhbG...
SUPABASE_SERVICE_ROLE_KEY       = eyJhbG...
STRIPE_SECRET_KEY               = sk_test_...     ← 上线后改成 sk_live_...
STRIPE_WEBHOOK_SECRET           = whsec_...       ← 第 10 步获取生产的
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_...  ← 上线后改成 pk_live_...
STRIPE_PRICE_BASIC              = price_...
STRIPE_PRICE_PRACT              = price_...
STRIPE_PRICE_SUB_BASIC          = price_...
STRIPE_PRICE_SUB_PREM           = price_...
ANTHROPIC_API_KEY               = sk-ant-...
NEXT_PUBLIC_APP_URL             = https://qiorazen.com
```

> 先用 Test Mode 的 Stripe key 部署，验证一切正常后再切 Live。

### 9.4 部署

点击 **Deploy** → 等待构建完成（约 2–3 分钟）。

成功后 Vercel 会给你一个 URL：`https://qiorazen-xxx.vercel.app`

### 9.5 验证部署

用浏览器打开 Vercel URL，重复第 7 步的验证清单。

---

## 10. Stripe Webhook 生产配置

本地的 `stripe listen` 只在开发时有效。生产环境需要在 Stripe Dashboard 创建 webhook endpoint。

### 10.1 创建 Webhook Endpoint

1. Stripe Dashboard → **Developers** → **Webhooks**
2. 点击 **Add endpoint**
3. 填写：
   - **Endpoint URL**: `https://qiorazen.com/api/payments/webhook`
   - **Listen to**: 选择以下事件：
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
4. 点击 **Add endpoint**

### 10.2 获取生产 Webhook Secret

创建成功后，点击该 endpoint → **Signing secret** → **Reveal** → 复制。

回到 Vercel Dashboard → **Settings** → **Environment Variables**：
- 更新 `STRIPE_WEBHOOK_SECRET` 为刚才复制的值

然后重新部署（Vercel Dashboard → **Deployments** → 最新一条 → **Redeploy**）。

### 10.3 测试 Webhook

在 Stripe Dashboard → 刚才创建的 endpoint → **Send test webhook** → 选 `checkout.session.completed` → **Send**。

查看 Vercel 的 Function Logs（Vercel Dashboard → **Logs**）确认收到并处理成功。

---

## 11. 域名绑定

### 11.1 购买域名

推荐域名注册商：
- **Cloudflare Registrar**（最便宜，无加价）
- **Namecheap**
- **Google Domains**

你的域名：`qiorazen.com`（已购买）

### 11.2 在 Vercel 绑定

1. Vercel Dashboard → 你的项目 → **Settings** → **Domains**
2. 输入 `qiorazen.com` → **Add**
3. Vercel 会显示需要配置的 DNS 记录

### 11.3 配置 DNS

在域名注册商后台，添加 Vercel 给出的 DNS 记录：

**方式 A（推荐：用 Vercel DNS）**：
```
A    @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

**方式 B（用 CNAME）**：
```
CNAME @     cname.vercel-dns.com
CNAME www   cname.vercel-dns.com
```

DNS 生效需要几分钟到几小时。Vercel 会自动签发 SSL 证书。

### 11.4 更新配置

域名生效后，更新以下配置：

**Vercel 环境变量**：
```
NEXT_PUBLIC_APP_URL = https://qiorazen.com
```

**Supabase**：
- Dashboard → Authentication → URL Configuration → **Site URL** 改为 `https://qiorazen.com`
- Redirect URLs 添加 `https://qiorazen.com/api/auth/callback`

**Google OAuth**：
- Google Cloud Console → Credentials → 你的 OAuth Client → Authorized redirect URIs 添加 `https://xxxxx.supabase.co/auth/v1/callback`（如果之前用了 localhost 的）

**Stripe**（上线时）：
- 更新 webhook endpoint URL 为 `https://qiorazen.com/api/payments/webhook`

---

## 12. 上线后验证清单

部署完成后，按顺序过一遍：

### 功能验证

- [ ] 首页正常加载（中文 + 英文）
- [ ] 语言切换正常
- [ ] 免费测评完整流程（8 题 → 结果页 → 雷达图）
- [ ] 测评结果存入数据库（检查 Supabase Table Editor）
- [ ] Magic Link 登录（收到邮件 → 点击 → 登录成功）
- [ ] Google 登录（授权 → 回调 → 登录成功）
- [ ] 登录后 profile 自动创建（检查 profiles 表）
- [ ] 未登录访问 /dashboard 被重定向到 /login

### 合规验证

- [ ] 每个展示养生建议的页面都有免责声明横幅
- [ ] 页脚有 "仅供参考" 提示
- [ ] AI 输出中没有 "诊断/治疗/预防" 等禁用词
- [ ] 测评结果页没有任何医疗承诺

### 安全验证

- [ ] `.env.local` 没有被提交到 Git（`git log --all --full-history -- "*.env*"` 返回空）
- [ ] Supabase service_role key 没有暴露在前端（浏览器 Network 面板检查）
- [ ] RLS 生效（用浏览器 Supabase client 尝试读取其他用户数据 → 应该返回空）

### 性能验证

- [ ] 首页加载时间 < 3 秒（Chrome DevTools → Lighthouse）
- [ ] 测评页无明显卡顿

---

## 13. 常见问题

### Q: `pnpm install` 报错 `ERR_PNPM_UNSUPPORTED_ENGINE`

Node.js 版本太低。运行 `node --version` 确认 >= 18。

```bash
# 用 nvm 切换版本
nvm install 20
nvm use 20
```

### Q: 构建报错 `The `border-border` class does not exist`

Tailwind 配置缺少 CSS 变量颜色映射。确认 `apps/web/tailwind.config.ts` 中 `theme.extend.colors` 包含 `border: "hsl(var(--border))"` 等定义。（当前代码已修复此问题）

### Q: Supabase 登录后跳转失败（404 或空白页）

检查：
1. Supabase Dashboard → Authentication → URL Configuration → **Site URL** 是否正确
2. **Redirect URLs** 里是否包含 `http://localhost:3000/api/auth/callback`（本地）和 `https://qiorazen.com/api/auth/callback`（生产）

### Q: Google 登录报错 `redirect_uri_mismatch`

Google Cloud Console → Credentials → OAuth Client → **Authorized redirect URIs** 必须精确匹配：
```
https://你的supabase项目.supabase.co/auth/v1/callback
```
注意末尾没有 `/`。

### Q: Stripe Webhook 返回 400

1. 确认 `STRIPE_WEBHOOK_SECRET` 对应的是当前环境（本地 vs 生产）
2. 本地用 `stripe listen` 的 secret，生产用 Stripe Dashboard 里创建的 endpoint 的 secret
3. 确认 webhook route 没有被 Next.js middleware 拦截（当前 matcher 配置已排除 API routes）

### Q: Vercel 构建失败 `Cannot find module '@qiorazen/tcm-engine'`

Vercel 构建时需要从 monorepo 根目录开始。确认：
- Build Command: `cd ../.. && pnpm build --filter=@qiorazen/web`
- 或在 Vercel 项目设置中不设 Root Directory，让它自动检测 Turborepo

### Q: Magic Link 邮件收不到

Supabase Free 计划限制每小时 4 封邮件。解决方案：
1. 等一小时后重试
2. 升级 Supabase 到 Pro（$25/月）解除限制
3. 配置自定义 SMTP（Supabase → Project Settings → Auth → SMTP Settings）
   - 推荐用 Resend（免费 3000 封/月）或 SendGrid

### Q: 如何从 Test Mode 切换到 Live Mode（正式收款）

1. Stripe Dashboard → 右上角关闭 **Test mode** 开关
2. 获取 Live 环境的 Publishable key 和 Secret key
3. 重新创建 4 个 Product + Price（Live 和 Test 的数据是隔离的）
4. 重新创建 Webhook endpoint
5. 更新 Vercel 环境变量（所有 Stripe 相关的 key）
6. Redeploy

### Q: 如何给我爹创建专家账号

1. 先让他通过正常流程注册一个账号（Magic Link 或 Google）
2. 在 Supabase SQL Editor 执行：

```sql
-- 先查看他的 user id
SELECT id, email FROM public.profiles WHERE email = '他的邮箱';

-- 插入从业者记录（把 user_id 替换成上面查到的）
INSERT INTO public.practitioners (user_id, display_name, title, specialties, is_active)
VALUES (
  '查到的-uuid',
  '你爹的名字',
  '中医养生顾问',
  ARRAY['体质调理', '养生指导'],
  true
);
```

3. 他就可以访问 `/portal` 看到专家后台了

---

## 环境对照表

| 环境 | URL | Stripe Mode | 用途 |
|------|-----|-------------|------|
| 本地开发 | localhost:3000 | Test | 日常开发 |
| Vercel Preview | xxx-git-branch.vercel.app | Test | PR 预览 |
| Vercel Production | qiorazen.com | Live | 正式上线 |

每个环境用独立的环境变量。Vercel 支持按环境（Development / Preview / Production）设置不同值。

---

## 快速命令参考

```bash
# 开发
pnpm dev                          # 启动所有 workspace 的 dev server
pnpm --filter @qiorazen/web dev      # 只启动 web app
pnpm --filter @qiorazen/tcm-engine test  # 运行评分引擎测试

# 构建
pnpm build                        # 构建所有
pnpm --filter @qiorazen/web build    # 只构建 web app

# 本地 Stripe webhook
stripe listen --forward-to localhost:3000/api/payments/webhook

# 数据库（Supabase CLI，可选）
npx supabase login
npx supabase link --project-ref 你的项目ref
npx supabase db push              # 推送迁移

# 部署（推到 main 分支自动触发 Vercel 部署）
git push origin main
```
