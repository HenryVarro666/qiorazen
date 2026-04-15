# Qiorazen — Next Steps 开发计划

> **已完成**：Turborepo monorepo、GB/T 46939-2025 评分引擎（27 题，33 tests pass）、免费测评 + 雷达图 + 体质详情（形体/心理/季节/详细特征）、免费/付费内容分层（锁定卡片）、4 层定价（$49/$499/$1,499/Transformation）、登录（Magic Link + Google OAuth）、中英文 i18n、合规层（guardrails + 症状检测 + 免责声明）、7 张数据库表 + RLS、法律风险框架文档。
>
> **已部署**：Vercel → qiorazen.com（Cloudflare DNS）
>
> 以下是按优先级排列的待办任务。

---

## Phase 1：上线前必做（合规基础）

### 1.1 法律页面

| 页面 | 文件路径 | 内容来源 |
|------|---------|---------|
| Terms of Service | `apps/web/app/(public)/terms/page.tsx` | `LEGAL_RISK_FRAMEWORK.md` 第 4 节 |
| Privacy Policy | `apps/web/app/(public)/privacy/page.tsx` | `LEGAL_RISK_FRAMEWORK.md` 第 5 节 |

直接把 LEGAL_RISK_FRAMEWORK.md 中的 ToS 和 Privacy 模板渲染为页面。首页 footer 加链接。

### 1.2 注册同意流程

在用户首次使用前，强制勾选 5 个复选框（文本见 `LEGAL_RISK_FRAMEWORK.md` 第 2 节 Layer 2）。记录到 `consent_records` 表。

### 1.3 扩展 guardrails.ts 禁用词

把 `LEGAL_RISK_FRAMEWORK.md` 第 9 节的扩展禁用词加入 `guardrails.ts`。当前 16 个正则，目标 30+。

### 1.4 扩展 symptom-detector.ts

新增检测模式（见 `LEGAL_RISK_FRAMEWORK.md` 第 13 节）：便血/尿血、突发剧烈头痛、一侧麻木、言语不清、高烧、怀孕+任何不适、婴儿/宝宝+症状。

---

## Phase 2：付费核心流程

### 2.1 Stripe 支付集成

| 文件路径 | 说明 |
|---------|------|
| `apps/web/lib/stripe/client.ts` | 初始化 Stripe SDK |
| `apps/web/lib/stripe/prices.ts` | 3 个价格 ID 配置 |
| `apps/web/app/api/payments/checkout/route.ts` | POST：创建 Stripe Checkout Session |
| `apps/web/app/api/payments/subscription/route.ts` | POST：创建订阅；DELETE：取消 |
| `apps/web/app/api/payments/webhook/route.ts` | POST：处理 Stripe webhook |

**当前定价**：

| Tier | 名称 | 价格 | Stripe 产品名 | env var |
|------|------|------|--------------|---------|
| Entry | Starter Session | $49/次 | Qiorazen Starter Session | `STRIPE_PRICE_ENTRY` |
| Core | Core Wellness Membership | $499/月 | Qiorazen Core Wellness Membership | `STRIPE_PRICE_CORE_MONTHLY` |
| Premium | Premium Wellness Advisory | $1,499/月 | Qiorazen Premium Wellness Advisory | `STRIPE_PRICE_PREMIUM_MONTHLY` |

> Transformation ($4,999/年) 不在自助购买流程中，需要 3+ 月 Premium 后手动申请。

**Webhook 事件**：
- `checkout.session.completed` → insight_request.status = 'paid' → 触发 AI 管道
- `customer.subscription.created` → 创建 subscriptions 记录
- `invoice.paid` → 重置 questions_used_today = 0
- `customer.subscription.deleted` → subscription.status = 'cancelled'

**Stripe Dashboard 配置**：
1. 创建 3 个 Product + Price（名称见上表）
2. Webhook endpoint：`https://qiorazen.com/api/payments/webhook`
3. 本地测试：`stripe listen --forward-to localhost:3000/api/payments/webhook`

---

### 2.2 提问界面 + AI 管道

| 文件路径 | 说明 |
|---------|------|
| `apps/web/lib/ai/client.ts` | Anthropic SDK 客户端，`generateWellnessInsight()` |
| `apps/web/app/api/insights/route.ts` | GET：列出请求；POST：创建新请求 |
| `apps/web/app/api/insights/[id]/route.ts` | GET：获取详情 |
| `apps/web/app/(dashboard)/insights/new/page.tsx` | 提问页面（最多 3 个问题 + 可选舌象） |
| `apps/web/app/(dashboard)/insights/[id]/page.tsx` | 结果展示页 |
| `apps/web/components/insights/question-input.tsx` | 问题输入组件 |
| `apps/web/components/shared/emergency-redirect.tsx` | 紧急转介弹窗 |

**AI 管道流程（双层架构）**：

```
POST /api/insights
  → 验证用户已付款 OR 有订阅额度（daily_questions_limit）
  → 检测严重症状（symptom-detector.ts）
  → 如果检测到 → 阻止处理，显示 911/988
  → 获取用户的体质评分数据（screening_sessions）
  → 获取舌象分析（如有）
  → 调用 Claude API（system prompt + 体质数据 + 用户问题）
  → guardrails.ts 净化输出
  → 存入 insight_requests（status: ai_complete, ai_draft 存完整输出）
  → 自动设置 response_deadline（Entry 48h / Core 48h / Premium 24h）
  → 状态变为 practitioner_pending
```

**Insight 状态流**：
```
pending_payment → paid → ai_processing → ai_complete → practitioner_pending → practitioner_approved → delivered
```

**日限额检查**（Core/Premium 订阅）：
```typescript
if (subscription.tier === 'core' && questions_used_today >= 2) → 拒绝
if (subscription.tier === 'premium' && questions_used_today >= 3) → 拒绝
// 每天 UTC 0:00 重置 questions_used_today
```

**用户流程**：
```
测评结果页 → 点击 "Unlock" → 注册/登录 → 选择 Starter ($49)
→ Stripe Checkout → 付款成功 → 跳转提问页
→ 输入最多 3 个问题 + 可选上传舌象
→ 提交 → AI 处理（30-60 秒）
→ 结果页显示 AI 草稿
→ Wellness Advisor 审核确认（24-48h）
→ 用户收到最终版本 + 邮件通知
```

---

### 2.3 舌象上传 + Claude Vision

| 文件路径 | 说明 |
|---------|------|
| `apps/web/app/api/tongue/upload/route.ts` | POST：上传到 Supabase Storage |
| `apps/web/app/api/tongue/analyze/route.ts` | POST：Claude Vision 分析 |
| `apps/web/components/tongue/image-uploader.tsx` | 文件选择 + 拖放 |
| `apps/web/components/tongue/camera-capture.tsx` | 手机摄像头拍摄 |
| `apps/web/lib/tongue/preprocessor.ts` | 客户端压缩（canvas resize to 1024px） |

**Supabase Storage**：
- Bucket: `tongue-images`（private）
- 路径: `tongue-images/{user_id}/{uuid}.jpg`
- Signed URL 过期: 5 分钟
- 自动删除: 90 天后（用户可配置）

**同意流程**：上传前弹出同意框 → 记录到 consent_records → 提供删除选项

---

### 2.4 用户 Dashboard

| 文件路径 | 说明 |
|---------|------|
| `apps/web/app/(dashboard)/layout.tsx` | 侧边栏 + 头部布局 |
| `apps/web/app/(dashboard)/dashboard/page.tsx` | 首页（体质概览 + 最近请求） |
| `apps/web/app/(dashboard)/subscription/page.tsx` | 订阅管理（计划 + 用量 + 取消） |
| `apps/web/app/(dashboard)/settings/page.tsx` | 设置（语言、同意管理、数据删除） |

---

## Phase 3：Wellness Advisor 门户

### 3.1 Advisor 审核界面

**核心设计：AI 做 80% 的工作，Advisor 只需 1-2 分钟确认。**

| 文件路径 | 说明 |
|---------|------|
| `apps/web/app/(practitioner)/portal/page.tsx` | Dashboard（紧急案例数、今日已审核数、按 tier 分组） |
| `apps/web/app/(practitioner)/portal/cases/page.tsx` | 案例队列（按 deadline 紧迫度 → tier 优先级 → 提交时间 排序） |
| `apps/web/app/(practitioner)/portal/cases/[id]/page.tsx` | 案例审核页 |
| `apps/web/app/api/practitioner/cases/route.ts` | GET：带 SLA 排序的队列 |
| `apps/web/app/api/practitioner/cases/[id]/approve/route.ts` | POST：确认（含可选编辑/备注） |

**案例审核页布局**：
- 左侧：用户体质评分 + 雷达图 + 用户提的问题
- 中间：AI 生成的草稿（可内联编辑）
- 右侧：快捷操作面板
  - ✅ "一键确认"（最常用）
  - 📝 "添加个人备注"（可选，1-2 句话）
  - ✏️ 编辑模式（点击进入 AI 草稿修改）
  - 提交 → guardrails 检查 → 标记 practitioner_approved

**SLA 颜色编码**：
- 🔴 < 4h 到 deadline
- 🟡 < 12h 到 deadline
- 🟢 充足时间

**响应时限**：
| Tier | 目标 | 最大 |
|------|------|------|
| Entry ($49) | 24h | 48h |
| Core ($499/月) | 24h | 48h |
| Premium ($1,499/月) | 12h | 24h |

**安全要求**：
- Advisor 通过 `practitioners` 表验证，`is_active = true`
- RLS：只能看 `practitioner_pending` / `practitioner_approved` / `delivered` 状态
- 舌象通过 signed URL（5 分钟过期），不能下载
- 用户只显示 display_name，不显示邮箱
- Advisor 的备注经 guardrails 净化后才展示给用户
- 用户看到的是 "Qiorazen Wellness Insight"，不是某个 Advisor 的回复

### 3.2 Premium 专属功能

**每周主动 check-in（Premium 核心差异）**：

| 文件路径 | 说明 |
|---------|------|
| `apps/web/app/api/checkin/route.ts` | POST：触发每周 check-in |
| `apps/web/components/checkin/checkin-card.tsx` | Check-in 卡片组件 |

- 系统每周自动生成 check-in 提示（"最近睡眠怎么样？有变化吗？"）
- Advisor 可自定义 check-in 问题
- 用户回复 → 触发 AI 分析 → Advisor 确认 → 调整方案
- **这是 $1,499 vs $499 的核心差距**：Core 是 Reactive（你问我答），Premium 是 Proactive（我主动关注你）

### 3.3 初始 Advisor 设置

```sql
-- 在 Supabase SQL Editor 执行
-- 先让 Advisor 注册账号，然后找到 user_id：
SELECT id, email FROM public.profiles WHERE email = 'advisor_email';

INSERT INTO public.practitioners (user_id, display_name, title, specialties, is_active)
VALUES (
  '查到的-uuid',
  'Advisor 名字',
  'TCM Wellness Consultant',
  ARRAY['Constitution Analysis', 'Lifestyle Guidance'],
  true
);
```

---

## Phase 4：邮件通知 + 数据合规

### 4.1 邮件通知

**技术选型**：Resend（免费 3000 封/月）

| 触发事件 | 邮件内容 |
|---------|---------|
| Insight 已生成（AI 完成） | "Your wellness insight is being reviewed" |
| Advisor 确认完成 | "Your wellness insight is ready" |
| Premium 每周 check-in | "Your weekly wellness check-in" |
| 订阅续费成功 | "Your membership has been renewed" |

### 4.2 数据合规

| 任务 | 说明 |
|------|------|
| 舌象自动删除 | Supabase cron / Edge Function，每天检查 auto_delete_at |
| 数据删除请求 | 用户在设置页一键删除所有数据 |
| 同意管理 | 用户可查看和撤销各项同意 |
| 数据导出 | 用户可导出个人数据（CCPA 要求） |

---

## Phase 5：增长 + 优化

### 5.1 Analytics

- **PostHog**（开源，免费额度大）
- 追踪：测评完成率、付费转化率、Advisor 审核时间、留存率

### 5.2 性能

- Sentry 错误追踪
- API 限流（特别是 AI 和舌象接口）
- 图片优化（Next.js Image + sharp）

### 5.3 微信登录（可选）

- 微信开放平台注册
- Supabase 自定义 OAuth Provider
- 未来考虑微信小程序版测评

### 5.4 LLC 注册

- Delaware 或 Wyoming
- Single-member LLC
- General Liability + E&O 保险
- 详见 `LEGAL_RISK_FRAMEWORK.md` 第 12 节

---

## 后续迭代方向

### 产品
- **体质追踪**：定期重新测评，查看变化趋势图
- **季节养生推送**：二十四节气内容日历
- **自定义 ML 舌象模型**：收集数据后训练 ResNet50 替代 Claude Vision
- **多 Advisor 支持**：入驻系统 + 案例分配算法

### 技术
- **React Native 移动端**：共享 `@qiorazen/tcm-engine` 和 `@qiorazen/types`
- **WebSocket 实时推送**：AI 处理完成 / Advisor 确认后即时通知
- **A/B 测试**：定价、文案、UI 转化率优化

### 增长
- **小红书**：每周 3-4 条内容（舌象科普、体质测试、养生知识）
- **TikTok/抖音**：30 秒短视频（"你的舌头在告诉你什么？"）
- **微信公众号**：深度文章 + 小程序入口
- **Reddit**：r/TCM, r/wellness 社区
- **大学社团**：中国留学生社团推广
- **推荐奖励**：邀请朋友完成测评获得免费咨询额度

---

## 环境配置

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ENTRY=              # $49 Starter Session
STRIPE_PRICE_CORE_MONTHLY=       # $499/month Core
STRIPE_PRICE_PREMIUM_MONTHLY=    # $1,499/month Premium

# AI
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://qiorazen.com
```

### Supabase 设置
1. supabase.com 创建项目（Region: US East）
2. SQL Editor 依次执行 `packages/db/migrations/` 001-007
3. 创建 `tongue-images` Storage bucket（private, 5MB limit）
4. Authentication → Providers → 启用 Google OAuth
5. 获取 keys 写入 `.env.local`

### Stripe 设置
1. stripe.com 创建账号
2. 创建 3 个 Product + Price（名称/金额见 Phase 2.1）
3. Developers → Webhooks → 添加 `https://qiorazen.com/api/payments/webhook`
4. 事件：checkout.session.completed, customer.subscription.created/deleted, invoice.paid
5. 获取 keys 写入 `.env.local`

### 部署
- Vercel → 已连接 GitHub `HenryVarro666/qiorazen`
- 每次 `git push origin main` 自动部署
- 域名 qiorazen.com（Cloudflare DNS → Vercel CNAME）
