# Qiora — Next Steps 开发计划

> Sprint 1 已完成：monorepo 骨架、TCM 体质评分引擎（11 tests pass）、免费测评问卷 + 雷达图结果页、登录（Magic Link + Google OAuth）、中英文 i18n、合规层（AI guardrails + 严重症状检测）、7 张数据库表 + RLS 策略。
>
> 以下是 Sprint 2–4 的详细任务清单。

---

## Sprint 2（第 5–8 周）：付费咨询 + AI 管道

### 2.1 Stripe 支付集成

**目标**：用户可以通过单次付费或订阅购买深度洞察。

| 文件路径 | 说明 |
|---------|------|
| `apps/web/lib/stripe/client.ts` | 初始化 Stripe SDK，导出 stripe 实例 |
| `apps/web/lib/stripe/prices.ts` | 配置 4 个价格 ID（$19 基础 / $39 专家 / $99 月度 / $199 高级月度） |
| `apps/web/app/api/payments/checkout/route.ts` | POST：创建 Stripe Checkout Session（mode: payment） |
| `apps/web/app/api/payments/subscription/route.ts` | POST：创建订阅 Checkout；DELETE：取消订阅 |
| `apps/web/app/api/payments/webhook/route.ts` | POST：处理 Stripe webhook 事件 |
| `apps/web/components/payments/pricing-card.tsx` | 定价卡片组件（复用 landing page 定价区） |
| `apps/web/components/payments/checkout-button.tsx` | 付款按钮，跳转 Stripe Checkout |

**Webhook 需要处理的事件**：
- `checkout.session.completed` → 更新 insight_request.status = 'paid'，触发 AI 管道
- `customer.subscription.created` → 创建 subscriptions 记录
- `invoice.paid` → 重置 insights_used_this_period = 0
- `customer.subscription.deleted` → 更新 subscription status = 'cancelled'

**Stripe Dashboard 配置**：
1. 创建 4 个 Product + Price
2. 配置 Webhook endpoint 指向 `/api/payments/webhook`
3. 将 Price ID 写入 `.env.local`

**测试要点**：
- 使用 Stripe 测试模式的卡号 `4242 4242 4242 4242`
- `stripe listen --forward-to localhost:3000/api/payments/webhook` 本地测试 webhook
- 验证：付款成功 → insight 状态变为 paid → AI 管道启动

---

### 2.2 Claude API 集成（AI 管道）

**目标**：用户提交问题后，AI 生成合规的养生洞察。

| 文件路径 | 说明 |
|---------|------|
| `apps/web/lib/ai/client.ts` | Anthropic SDK 客户端，核心 `generateWellnessInsight()` 函数 |
| `apps/web/lib/ai/prompts.ts` | ✅ 已完成 — 系统提示词 |
| `apps/web/lib/ai/guardrails.ts` | ✅ 已完成 — 输出净化 |
| `apps/web/lib/ai/symptom-detector.ts` | ✅ 已完成 — 严重症状检测 |
| `apps/web/app/api/insights/route.ts` | GET：列出用户的 insight 请求；POST：创建新请求 |
| `apps/web/app/api/insights/[id]/route.ts` | GET：获取单个 insight 详情；PATCH：更新状态 |

**AI 管道流程**：
```
POST /api/insights
  → 验证用户已付款或有订阅额度
  → 检测严重症状（symptom-detector.ts）
  → 如果检测到 → 返回 emergency_redirect，不处理
  → 获取用户的 screening_session 数据（体质评分）
  → 获取 tongue_image 分析结果（如有）
  → 调用 Claude API（system prompt + 用户问题 + 体质数据）
  → 对 AI 输出运行 guardrails.ts 净化
  → 存入 insight_requests 表
  → 返回结果
```

**`lib/ai/client.ts` 核心函数**：
```typescript
import Anthropic from "@anthropic-ai/sdk";
import { WELLNESS_INSIGHT_SYSTEM_PROMPT, buildUserMessage } from "./prompts";
import { sanitizeOutput } from "./guardrails";

export async function generateWellnessInsight(input: {
  constitutionScores: ConstitutionScores;
  primaryConstitution: ConstitutionType;
  userQuestions: string[];
  tongueAnalysis?: TongueAnalysisResult;
  language: "en" | "zh";
}) {
  const anthropic = new Anthropic();
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: WELLNESS_INSIGHT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserMessage(input) }],
  });

  const rawText = response.content[0].type === "text" ? response.content[0].text : "";
  const parsed = JSON.parse(rawText);
  const sanitized = sanitizeOutput(JSON.stringify(parsed));
  return { raw: parsed, sanitized: JSON.parse(sanitized.sanitizedText), violations: sanitized.violations };
}
```

**测试要点**：
- 创建 10 个不同体质的测试 profile，验证 AI 输出
- 验证净化后的输出不包含任何 banned terms
- 验证中文和英文输出都正常
- 在 AI 输出中手动注入 banned term，验证 guardrails 能捕获

---

### 2.3 舌象上传 + Claude Vision 分析

**目标**：用户上传舌头照片，AI 分析舌象特征。

| 文件路径 | 说明 |
|---------|------|
| `apps/web/app/api/tongue/upload/route.ts` | POST：上传图片到 Supabase Storage |
| `apps/web/app/api/tongue/analyze/route.ts` | POST：调用 Claude Vision 分析舌象 |
| `apps/web/components/tongue/image-uploader.tsx` | 文件选择 + 拖放上传组件 |
| `apps/web/components/tongue/camera-capture.tsx` | 手机摄像头拍摄组件（MediaDevices API） |
| `apps/web/components/tongue/image-preview.tsx` | 图片预览 + 重拍/重选 |
| `apps/web/lib/tongue/preprocessor.ts` | 客户端图片压缩（canvas resize to 1024px max） |
| `apps/web/lib/tongue/api-client.ts` | 调用 analyze API 的客户端函数 |

**Claude Vision 分析实现**：
```typescript
// apps/web/app/api/tongue/analyze/route.ts
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1000,
  messages: [{
    role: "user",
    content: [
      {
        type: "image",
        source: { type: "base64", media_type: "image/jpeg", data: imageBase64 },
      },
      { type: "text", text: TONGUE_ANALYSIS_PROMPT },
    ],
  }],
});
// 返回结构化 JSON：tongue_color, coating, shape, features, observations
```

**Supabase Storage 配置**：
1. 创建 `tongue-images` bucket（private）
2. 设置 RLS：用户只能访问自己的图片
3. 图片路径格式：`tongue-images/{user_id}/{uuid}.jpg`
4. 设置 signed URL 过期时间：5 分钟

**用户同意流程**：
- 上传前弹出同意对话框：确认图片仅用于养生分析
- 创建 consent_records 记录（consent_type: 'tongue_image_collection'）
- 提供自动删除选项（默认 90 天后删除）

**测试要点**：
- 测试不同光线条件下的舌象照片
- 验证非舌头图片的处理（AI 应该返回 "无法识别" 类的回复）
- 验证图片压缩后大小 < 1MB
- 验证 signed URL 过期后无法访问

---

### 2.4 洞察请求完整流程

**目标**：端到端付费咨询流程。

| 文件路径 | 说明 |
|---------|------|
| `apps/web/app/(dashboard)/insights/new/page.tsx` | 提交新洞察请求页面（问题输入 + 舌象上传 + 付款） |
| `apps/web/app/(dashboard)/insights/page.tsx` | 洞察历史列表页 |
| `apps/web/app/(dashboard)/insights/[id]/page.tsx` | 单个洞察详情页（结果展示） |
| `apps/web/components/insights/question-input.tsx` | 问题输入组件（最多 3 个，字数限制） |
| `apps/web/components/insights/insight-card.tsx` | 洞察结果卡片（体质摘要 + 建议 + 免责声明） |
| `apps/web/components/shared/emergency-redirect.tsx` | 紧急转介弹窗（911/988） |

**用户流程**：
```
/insights/new
  → 显示已有的体质测评结果
  → 输入最多 3 个问题
  → 可选上传舌象照片
  → 选择服务等级（$19 AI / $39 AI+专家）
  → 点击付款 → Stripe Checkout
  → 付款成功 → 跳转 /insights/{id}?payment=success
  → AI 处理中（显示 loading 状态）
  → AI 完成 → 展示结果
  → 如选 $39 → 状态变为 "等待专家点评"
```

**测试要点**：
- 完整走一遍用户付费 → 获取洞察的流程
- 验证订阅用户可以使用额度而不付款
- 验证超出订阅额度后提示付费
- 验证严重症状输入触发紧急转介

---

### 2.5 用户 Dashboard

| 文件路径 | 说明 |
|---------|------|
| `apps/web/app/(dashboard)/layout.tsx` | Dashboard 布局（侧边栏 + 头部） |
| `apps/web/app/(dashboard)/dashboard/page.tsx` | 用户首页（体质概览 + 最近洞察 + 快捷操作） |
| `apps/web/app/(dashboard)/subscription/page.tsx` | 订阅管理页（当前计划 + 用量 + 取消） |
| `apps/web/app/(dashboard)/settings/page.tsx` | 设置页（语言、同意管理、数据删除请求） |
| `apps/web/components/layout/sidebar.tsx` | 侧边栏导航 |
| `apps/web/components/layout/header.tsx` | 头部（用户头像、语言切换） |

---

## Sprint 3（第 9–12 周）：专家门户 + 订阅系统

### 3.1 专家（从业者）门户

**目标**：你爹能通过网页端看到待审核的案例，提交点评。

| 文件路径 | 说明 |
|---------|------|
| `apps/web/app/(practitioner)/layout.tsx` | 专家门户布局 |
| `apps/web/app/(practitioner)/portal/page.tsx` | 专家首页（统计卡片 + 快捷入口） |
| `apps/web/app/(practitioner)/portal/cases/page.tsx` | 案例队列（筛选、排序、优先级） |
| `apps/web/app/(practitioner)/portal/cases/[id]/page.tsx` | 案例详情 + 点评表单 |
| `apps/web/app/(practitioner)/portal/settings/page.tsx` | 专家设置 |
| `apps/web/app/api/practitioner/cases/route.ts` | GET：获取案例队列 |
| `apps/web/app/api/practitioner/cases/[id]/route.ts` | GET：案例详情 |
| `apps/web/app/api/practitioner/cases/[id]/notes/route.ts` | POST：提交点评 |
| `apps/web/components/practitioner/case-list.tsx` | 案例列表组件 |
| `apps/web/components/practitioner/case-detail.tsx` | 案例详情组件 |
| `apps/web/components/practitioner/review-form.tsx` | 点评表单组件 |

**案例详情页内容**：
- 左栏：用户测评结果、体质评分雷达图、用户提的 3 个问题
- 右栏：AI 生成的洞察（AI 已经给用户看的内容）
- 底部：舌象照片 + AI 分析结果（如有）
- 点评区：文本框 + "同意 AI 评估" / "修改评估" 复选框
- 提交后 → insight_requests.status 变为 `completed`

**安全要求**：
- 专家通过 `practitioners` 表验证身份，`is_active = true`
- RLS 策略：只能看 status 为 `practitioner_review` 或 `completed` 的案例
- 舌象照片通过 signed URL 展示（5 分钟过期），不能下载
- 不显示用户真实姓名和邮箱（只显示 display_name 或匿名 ID）

**专家点评 → 用户可见**：
- 专家写的点评是内部笔记（practitioner_notes）
- 平台将点评重新整理为合规输出（经过 guardrails 净化）
- 存入 final_insight 字段后才展示给用户

**初始设置**：
- 用 SQL seed 给你爹创建专家账号
- `packages/db/seed.sql`：插入 practitioner 记录

---

### 3.2 订阅系统完善

| 任务 | 说明 |
|------|------|
| 订阅选择页 | 展示 Basic ($99) 和 Premium ($199) 两个计划 |
| 订阅状态管理 | Stripe webhook 处理续费、欠费、取消 |
| 额度扣减逻辑 | 创建 insight 时检查订阅 → 扣减 insights_used_this_period |
| 额度重置 | invoice.paid webhook → reset insights_used_this_period = 0 |
| 订阅管理页 | 查看当前计划、已用额度、下次续费日期、取消 |
| 取消确认 | 取消后仍可使用到当前周期结束 |

---

### 3.3 邮件通知

| 触发事件 | 邮件内容 |
|---------|---------|
| insight 处理完成 | "您的养生洞察已生成" |
| 专家完成点评 | "专家已为您的咨询提供了点评" |
| 订阅即将到期 | 提前 3 天提醒 |
| 订阅续费成功 | "您的月度额度已重置" |

**技术选型**：Supabase Edge Functions + Resend / SendGrid

---

## Sprint 4（第 13–16 周）：合规打磨 + 上线

### 4.1 法律页面

| 页面 | 文件路径 | 说明 |
|------|---------|------|
| Terms of Service | `apps/web/app/(public)/terms/page.tsx` | 服务条款（中英文） |
| Privacy Policy | `apps/web/app/(public)/privacy/page.tsx` | 隐私政策（中英文） |
| Disclaimer | `apps/web/app/(public)/disclaimer/page.tsx` | 免责声明（中英文） |

**必须包含的关键条款**：
- 本平台不建立医患关系
- 用户自行承担健康决策责任
- 平台不对因使用建议导致的后果负责
- 从业者可能不持有美国州级执照
- 健康数据的收集、存储、使用和删除方式
- 禁止将平台用于替代急诊医疗

**建议**：上线前请健康科技领域律师审核（预算 $2,000–5,000）

---

### 4.2 数据合规

| 任务 | 说明 |
|------|------|
| 舌象自动删除 | Supabase Edge Function / cron job，每天检查 auto_delete_at 到期的图片 |
| 数据删除请求 | 用户可在设置页请求删除所有个人数据 |
| 同意管理界面 | 用户可在设置页查看和撤销各项同意 |
| 数据导出 | 用户可导出自己的所有数据（GDPR 要求） |
| Breach 通知流程 | 文档化：发现泄露 → 60 天内通知用户（FTC 要求） |

---

### 4.3 微信登录

| 任务 | 说明 |
|------|------|
| 微信开放平台注册 | 申请网站应用，获取 AppID 和 AppSecret |
| Supabase 自定义 OAuth Provider | 或使用 Auth.js 适配器 |
| 微信回调处理 | `/api/auth/wechat/callback` |
| 微信小程序（未来） | 考虑做小程序版的测评问卷 |

---

### 4.4 性能与监控

| 任务 | 说明 |
|------|------|
| Sentry 集成 | 错误追踪，特别关注 AI 管道和支付流程的错误 |
| Analytics | Mixpanel 或 PostHog，追踪：测评完成率、付费转化率、留存率 |
| 图片优化 | Next.js Image 组件 + sharp 压缩 |
| API 限流 | 防止滥用，特别是 AI 和舌象分析接口 |
| Supabase 连接池 | 配置 pgBouncer 应对并发 |

---

### 4.5 Beta 测试 + 上线

| 任务 | 说明 |
|------|------|
| 种子用户 | 找 10–20 个目标用户（留学生/华侨朋友）测试 |
| 你爹 UAT | 专家门户的用户验收测试 |
| Bug 修复 | 根据测试反馈修复 |
| Production 部署 | Vercel production 环境 + 正式 Supabase 项目 |
| 域名 | qiorazen.com（已购买） |
| SSL | Vercel 自动处理 |

---

## 后续迭代方向（上线后）

### 产品增强
- **自定义 ML 舌象模型**：收集足够数据后训练 ResNet50 替代 Claude Vision，降低成本
- **体质追踪**：用户可定期重新测评，查看体质变化趋势
- **季节养生推送**：根据节气推送养生建议（二十四节气内容日历）
- **多从业者支持**：支持多个专家入驻，分配算法
- **学生优惠**：.edu 邮箱验证后享受 $49/月订阅价

### 技术增强
- **React Native 移动端**：共享 `tcm-engine` 和 `types` 包
- **WebSocket 实时更新**：AI 处理完成后实时推送通知
- **AI 模型微调**：基于用户反馈和专家修正持续优化提示词
- **A/B 测试框架**：测试不同问卷问题、定价、UI 对转化率的影响

### 增长渠道
- **小红书 (RED)**：每周 3–4 条内容（舌象科普、体质测试、养生知识）
- **TikTok/抖音**：30 秒短视频（"你的舌头在告诉你什么？"）
- **微信公众号**：深度文章 + 小程序入口
- **Reddit**：r/TCM, r/ChineseFood, r/wellness 社区
- **大学社团合作**：中国留学生社团推广
- **推荐奖励**：邀请朋友完成测评获得免费咨询额度

---

## 环境配置清单

上线前需要配置的所有外部服务：

```
# .env.local 需要的所有 key

# Supabase（supabase.com 创建项目）
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe（stripe.com 创建账号）
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_BASIC=         # $19 单次
STRIPE_PRICE_PRACT=         # $39 单次+专家
STRIPE_PRICE_SUB_BASIC=     # $99/月
STRIPE_PRICE_SUB_PREM=      # $199/月

# Anthropic（console.anthropic.com）
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://qiorazen.com
```

### Supabase 项目设置步骤
1. 在 supabase.com 创建新项目
2. 在 SQL Editor 中依次执行 `packages/db/migrations/` 下的 7 个迁移文件
3. 创建 `tongue-images` Storage bucket（设为 private）
4. 启用 Google OAuth provider（Authentication → Providers → Google）
5. 获取 URL、anon key、service role key 写入 `.env.local`

### Stripe 设置步骤
1. 在 stripe.com 创建账号
2. 创建 4 个 Product：Free Screening / Deeper Insight / Expert Insight / Monthly Plan
3. 为每个 Product 创建 Price（金额如上）
4. 在 Developers → Webhooks 添加 endpoint：`https://qiorazen.com/api/payments/webhook`
5. 选择事件：checkout.session.completed, customer.subscription.created/deleted, invoice.paid
6. 获取各 key 写入 `.env.local`
