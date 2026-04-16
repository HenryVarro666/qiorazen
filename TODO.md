# Qiorazen — TODO

> 按顺序执行。每完成一步打勾。

---

## Step 0: 提交代码并部署

- [ ] `git add` 并 commit 所有改动
- [ ] `git push origin main` — Vercel 自动部署

---

## Step 1: 配置 Supabase ✅ 已完成

- [x] 创建项目 `qiorazen`（US East）
- [x] 获取 Keys → 写入 `.env.local`
- [x] 执行 7 个数据库迁移（SQL Editor）
- [x] 配置 Google OAuth（Google Cloud Console + Supabase Provider）
- [x] 配置 Phone Auth（Twilio SMS Provider）
- [x] 配置 URL Configuration（localhost redirect）
- [ ] 创建 Storage Bucket `tongue-images`（舌象上传用，后续需要时做）
- [ ] 自定义 Email 模板（品牌化，可选）

---

## Step 2: 配置 Stripe

### 2.1 创建 Stripe 账号

1. 打开 https://stripe.com → 注册
2. 开发阶段用 **Test mode**（Dashboard 右上角开关）

### 2.2 创建产品和价格

Products → Add product，创建 3 个：

| 产品名 | 价格 | 计费方式 |
|--------|------|---------|
| Qiorazen Starter Session | $49.00 | One time |
| Qiorazen Core Wellness Membership | $499.00 | Recurring / Monthly |
| Qiorazen Premium Wellness Advisory | $1,499.00 | Recurring / Monthly |

每个创建完后复制 **Price ID**（`price_xxx`）。

### 2.3 配置 Webhook

1. Developers → Webhooks → Add endpoint
2. URL: `https://qiorazen.com/api/payments/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.deleted`, `invoice.paid`
4. 复制 Signing secret（`whsec_xxx`）

### 2.4 写入环境变量

```env
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ENTRY=price_xxx
STRIPE_PRICE_CORE_MONTHLY=price_xxx
STRIPE_PRICE_PREMIUM_MONTHLY=price_xxx
```

### 2.5 本地测试

```bash
stripe login
stripe listen --forward-to localhost:3000/api/payments/webhook
```

---

## Step 3: 配置 Anthropic API

1. https://console.anthropic.com → API Keys → Create Key
2. 写入 `.env.local`：`ANTHROPIC_API_KEY=sk-ant-xxx`

> 不配也能运行（mock 模式），正式上线需要。

---

## Step 4: 配置 Vercel 环境变量

Settings → Environment Variables，添加所有 key（Production + Preview）：

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_PRICE_ENTRY
STRIPE_PRICE_CORE_MONTHLY
STRIPE_PRICE_PREMIUM_MONTHLY
ANTHROPIC_API_KEY
NEXT_PUBLIC_APP_URL=https://qiorazen.com
```

添加完后 Redeploy。

---

## Step 5: 注册 Advisor 账号

1. 让你爸在 qiorazen.com 注册
2. Supabase SQL Editor 执行：

```sql
SELECT id, email FROM public.profiles WHERE email = '他的邮箱';

INSERT INTO public.practitioners (user_id, display_name, title, specialties, is_active)
VALUES ('查到的uuid', '曹医生', 'TCM Wellness Consultant',
  ARRAY['Constitution Analysis', 'Lifestyle Guidance'], true);
```

3. 他访问 /portal 即可看到 Advisor Dashboard

---

## Step 6: 端到端验证

- [ ] 首页 → Start Free Screening → 完成 27 题 → 看到结果
- [ ] 点 Unlock Now → 登录（Google / 手机号 / Email）
- [ ] 跳转到付费选择页 → Stripe Checkout（测试卡 `4242 4242 4242 4242`）
- [ ] 付款成功 → 提问 → 收到 AI 回复
- [ ] Advisor 登录 /portal → 审核通过
- [ ] 用户 Dashboard 看到状态更新
- [ ] 重新测评 → 历史记录显示两次对比

---

## 后续开发

### P0 — 上线前必须

| 任务 | 说明 | 状态 |
|------|------|------|
| 提交代码 + 部署 | commit → push → Vercel | 待做 |
| 配置 Stripe | 产品 + Webhook + 环境变量 | 待做 |
| Vercel 环境变量 | 所有 key 配入 Production | 待做 |
| Anthropic API Key | AI 真实回复 | 待做 |

### P1 — 核心功能完善

| 任务 | 说明 | 状态 |
|------|------|------|
| 舌象上传 + Claude Vision | API + 组件 + 上传前同意 | 待做 |
| 邮件通知（Resend） | Advisor 审核完成时通知用户 | 待做 |
| Apple ID 登录 | 需要 Apple Developer 账号 $99/年 | 暂缓 |

### P2 — 合规 + 用户体验

| 任务 | 说明 | 状态 |
|------|------|------|
| 注册同意流程（5 checkbox） | LEGAL_RISK_FRAMEWORK 要求 | 待做 |
| 用户设置页 | 语言、同意管理、数据删除 | 待做 |
| 订阅管理页 | 查看/取消订阅 | 待做 |
| Supabase URL Config 更新 | 部署后加 qiorazen.com 到 redirect URLs | 待做 |
| Google OAuth redirect URI | 加 qiorazen.com 回调地址 | 待做 |

### P3 — 增长 + 运维

| 任务 | 说明 | 状态 |
|------|------|------|
| Premium 每周 Check-in | $1,499 vs $499 核心差异 | 待做 |
| Analytics（PostHog） | 转化率追踪 | 待做 |
| Sentry 错误监控 | 生产环境错误追踪 | 待做 |
| LLC 注册 | Delaware/Wyoming，见 LEGAL_RISK_FRAMEWORK | 待做 |

---

## 已完成的工作

- [x] Turborepo monorepo + 3 packages
- [x] GB/T 46939-2025 评分引擎（33 tests pass）
- [x] 27 题问卷 + 雷达图 + 详细体质报告
- [x] 免费/付费内容分层（锁定卡片）
- [x] 4 层定价页面
- [x] 登录（Google OAuth + 手机号 OTP + Email Magic Link）
- [x] 中英文 i18n
- [x] 合规层（42 guardrails + 40 symptom detector + 免责声明）
- [x] 7 张数据库表 + RLS
- [x] 法律页面（Terms + Privacy）
- [x] 测评结果持久化 + 关联账户
- [x] 付费拦截（insights/new 检查付费状态）
- [x] Stripe Checkout + Webhook 集成
- [x] AI Pipeline（Claude API + mock fallback）
- [x] 用户 Dashboard（体质档案 + insight 历史 + 状态 badge）
- [x] 测评历史页（多次测评对比 + 趋势追踪）
- [x] Insight 详情页（状态追踪 + 内容展示）
- [x] Practitioner Portal（真实数据 + 审核 + guardrails）
- [x] 导航优化（登录感知 header + 问卷返回按钮）

---

## 关键文件速查

| 用途 | 路径 |
|------|------|
| 环境变量 | `apps/web/.env.local` |
| 数据库迁移 | `packages/db/migrations/001-007` |
| 合规框架 | `LEGAL_RISK_FRAMEWORK.md` |
| AI guardrails | `apps/web/lib/ai/guardrails.ts` |
| 急救拦截 | `apps/web/lib/ai/symptom-detector.ts` |
| Stripe 配置 | `apps/web/lib/stripe/` |
| Supabase 客户端 | `apps/web/lib/supabase/` |
| 登录页 | `apps/web/app/(auth)/login/page.tsx` |
| Dashboard | `apps/web/app/(dashboard)/dashboard/page.tsx` |
| Advisor Portal | `apps/web/app/(practitioner)/portal/` |
