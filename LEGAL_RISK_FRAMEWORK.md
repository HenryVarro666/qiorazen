# Qiorazen 法律风险规避框架
# Legal Risk Mitigation Framework

---

## 核心定位（一句话，所有人必须背下来）

> **"We provide AI-assisted wellness insights based on traditional practices for lifestyle improvement, not medical care."**
>
> **"我们提供基于传统养生理念的 AI 辅助健康生活方式建议，而非医疗服务。"**

你不是在卖"医疗服务"，你是在卖 **"健康认知 + 生活方式优化"**。

---

## 1. 风险评级：当前状态审计

### 已实施 ✅

| 防护层 | 状态 | 文件 |
|-------|------|------|
| AI 输出禁用词扫描（16 个正则） | ✅ 已实施 | `apps/web/lib/ai/guardrails.ts` |
| AI 系统提示词合规约束 | ✅ 已实施 | `apps/web/lib/ai/prompts.ts` |
| 严重症状检测（急救拦截） | ✅ 已实施 | `apps/web/lib/ai/symptom-detector.ts` |
| 页面免责声明（banner + footer） | ✅ 已实施 | `apps/web/lib/compliance/disclaimers.ts` |
| 产品文案去医疗化 | ✅ 已实施 | `messages/en.json`, `messages/zh.json` |
| 数据存储仅限美国 | ✅ 已设计 | Supabase US region |

### 未实施 ❌（按阶段完成）

| 防护层 | 阶段 | 说明 |
|-------|------|------|
| Terms of Service 页面 | 🔴 上线前 | 见第 4 节 |
| Privacy Policy 页面 | 🔴 上线前 | 见第 5 节 |
| 注册前强制同意 3 个复选框 | 🔴 上线前 | 见第 2 节 |
| 每次咨询前弹窗确认 | 🟡 付费上线前 | 见第 2 节 |
| 回复自动附加免责声明 | 🟡 付费上线前 | 每条回复底部 |
| 医生合同 | 🟡 付费上线前 | 见第 6 节 |
| 禁用词扩展 | 🟡 付费上线前 | 见第 8 节 |
| LLC 注册 | 🟢 规模化前 | 见第 10 节 |
| Healthcare attorney 审核 | 🟢 规模化前 | $2,000-5,000 |

---

## 2. 三层免责声明（直接可用）

### Layer 1: 首页底部（短版）

```
Disclaimer: This platform provides wellness and lifestyle guidance based on 
traditional practices. It does NOT provide medical advice, diagnosis, or treatment. 
Always consult a licensed healthcare provider for medical concerns.
```

> 当前已实施在 `disclaimers.ts` 的 banner 字段。

### Layer 2: 注册时强制勾选（标准版）

用户必须逐一勾选，缺一不可：

```
By using this service, you acknowledge and agree that:

☐ 1. The information provided on this platform is for general wellness 
     and educational purposes only.

☐ 2. This service does NOT provide medical advice, diagnosis, or treatment. 
     The content and responses are not a substitute for professional medical 
     care from a licensed physician.

☐ 3. If you are experiencing a medical emergency, you should immediately 
     call 911 or seek emergency medical attention.

☐ 4. Any lifestyle or wellness suggestions are based on general traditional 
     practices and may not be suitable for your specific situation.

☐ 5. You assume full responsibility for how you use the information provided.
```

### Layer 3: 每次咨询前弹窗（强制）

```
Before continuing:

• This is NOT a medical consultation.
• We do NOT diagnose or treat diseases.
• If you have severe or urgent symptoms, please seek immediate medical care.

Do you agree to proceed?
[Agree] [Cancel]
```

### Layer 4: 每条回复底部（自动附加）

```
─────────────────────────
This is general wellness and lifestyle guidance based on traditional practices. 
It is for educational purposes only and is NOT medical advice, diagnosis, or treatment. 
Always consult a licensed healthcare professional for medical concerns.
─────────────────────────
```

---

## 3. 风险分级模型（每个功能必须过这个表）

### 🟢 低风险（推荐先做）

不涉及具体个人诊断，偏"内容+建议"。

| 功能 | 风险 | 说明 |
|------|------|------|
| AI 问卷体质分析 | 🟢 | 传统分类，非疾病诊断 |
| "你可能属于偏寒体质" | 🟢 | 传统体系描述 |
| 饮食建议（少吃冷饮） | 🟢 | 生活方式建议 |
| 作息建议（早睡早起） | 🟢 | 生活习惯 |
| 运动建议（适度散步） | 🟢 | 生活方式 |
| 季节养生提示 | 🟢 | 教育信息 |

**→ V1 只做这个层级。**

### 🟡 中风险（当前模式，需要强防护）

有"人"参与，有个性化建议。

| 功能 | 风险 | 必须的防护 |
|------|------|-----------|
| 医生回复用户问题 | 🟡 | 强免责声明 + 去医疗术语 + 平台署名 |
| 看舌头照片给建议 | 🟡 | 仅说"传统角度的观察"，不说"诊断" |
| 个性化调理建议 | 🟡 | 只讲"调理"不讲"治疗" |

**→ 风险点：很容易被认定为医疗行为。**
**→ 解决：强免责 + 去术语 + 平台作为内容整理方。**

### 🔴 高风险（绝对禁止）

明确的医疗行为，一旦发生可能涉及非法行医、医疗责任诉讼。

| 功能 | 风险 | 后果 |
|------|------|------|
| "你是XX病" | 🔴 | 非法行医 |
| 推荐具体中药方/剂量 | 🔴 | 处方行为 |
| "你不用去看医生" | 🔴 | 延误治疗责任 |
| 慢病管理建议 | 🔴 | 医疗服务认定 |
| 停药建议 | 🔴 | 直接医疗干预 |
| 孕妇/儿童具体建议 | 🔴 | 高风险群体 |

---

## 4. Terms of Service（直接可上线版）

放在 `/terms` 页面。

```
TERMS OF SERVICE

Last updated: [Date]

1. Nature of Service
   Qiorazen provides AI-assisted wellness and lifestyle guidance based on 
   traditional health practices. It does not provide medical services.

2. No Medical Advice
   The information provided is not intended to diagnose, treat, cure, or 
   prevent any disease. You should consult a licensed healthcare provider 
   for medical concerns.

3. User Responsibility
   You agree that you are solely responsible for how you interpret and 
   use the information provided.

4. No Doctor-Patient Relationship
   Use of this platform does not establish a doctor-patient relationship.

5. Limitation of Liability
   To the maximum extent permitted by law, the platform and its affiliates 
   shall not be liable for any damages resulting from the use of this service. 
   Maximum liability shall not exceed the amount paid for the specific service.

6. Indemnification
   You agree to indemnify and hold harmless the platform from any claims 
   arising from your use of the service.

7. Governing Law
   These Terms shall be governed by the laws of the State of Delaware, 
   United States.

8. Dispute Resolution
   Any disputes shall be resolved through binding arbitration.

9. Modifications
   We reserve the right to update these terms at any time. Continued use 
   of the service constitutes acceptance of updated terms.
```

---

## 5. Privacy Policy（直接可上线版）

放在 `/privacy` 页面。

```
PRIVACY POLICY

Last updated: [Date]

1. Information We Collect
   - Account information (email, display name)
   - Wellness screening questionnaire responses
   - Constitution assessment results
   - Questions submitted for wellness guidance
   - Tongue images (if voluntarily uploaded)
   - Usage data (pages visited, features used)

2. How We Use Your Data
   - To provide personalized wellness insights
   - To facilitate wellness advisor review
   - To improve our services (anonymized data only)
   - We NEVER sell personal data to third parties

3. Data Storage & Security
   - All data stored on U.S.-based servers
   - Encrypted at rest and in transit (TLS 1.2+)
   - Access restricted to authorized personnel only

4. Tongue Images
   - Stored in encrypted private storage
   - Accessible only to your assigned wellness advisor
   - Auto-deleted after 90 days (user configurable)
   - Never shared externally or used for facial recognition

5. Your Rights
   - Access: Request a copy of all your data
   - Deletion: Request complete deletion of your account and data
   - Opt-out: Withdraw consent for data processing at any time
   - Contact: hello@qiorazen.com

6. Not HIPAA Covered
   Qiorazen is a wellness platform, not a healthcare provider. We implement 
   strong security practices but do not claim HIPAA compliance.

7. Breach Notification
   In the event of unauthorized access to health-related data, we will 
   notify affected users within 60 days per FTC Health Breach Notification Rule.

8. California Residents (CCPA)
   California residents have additional rights including the right to know, 
   delete, and opt-out. We do not sell personal data.

9. Changes
   We may update this policy periodically. Material changes will be notified 
   via email or platform notice.
```

---

## 6. 医生合同（Independent Wellness Consultant Agreement）

最关键的风险隔离文件。

```
INDEPENDENT WELLNESS CONSULTANT AGREEMENT

This Agreement is made between:
Qiorazen LLC ("Company") and [Consultant Name] ("Consultant")

1. ROLE
   Consultant provides general wellness and lifestyle guidance based on 
   traditional practices. Consultant reviews AI-generated wellness drafts 
   and may add lifestyle commentary.

2. NO MEDICAL SERVICES
   Consultant agrees that they are NOT providing:
   - Medical advice, diagnosis, or treatment
   - Prescription of medications or supplements with specific dosages
   - Advice to discontinue or modify medical treatment
   - Assessment of specific diseases or medical conditions

3. NO DOCTOR-PATIENT RELATIONSHIP
   No doctor-patient or provider-patient relationship is created between 
   Consultant and any user of the Platform.

4. INDEPENDENT CONTRACTOR
   Consultant is an independent contractor, not an employee.

5. CONTENT GUIDELINES
   Consultant agrees to:
   - Review AI-generated drafts only (not write from scratch)
   - Use only wellness and lifestyle language
   - Flag and escalate any user presenting emergency symptoms
   - Never use the words: diagnose, treat, cure, prescribe, patient

6. CONTENT REVIEW
   All Consultant outputs are subject to automated compliance review 
   before delivery to users. Company reserves the right to modify or 
   block non-compliant content.

7. PUBLIC IDENTITY
   Consultant shall be referred to as "Wellness Advisor" or "TCM Wellness 
   Consultant" on the platform. The title "Doctor" or "Dr." shall not be 
   used in user-facing content.

8. INDEMNIFICATION
   Consultant indemnifies Company against any claims arising from 
   Consultant's deviation from the approved scope of services.

9. CONFIDENTIALITY
   Consultant agrees not to disclose, download, or store user information 
   outside the platform.

10. COMPENSATION
    [Define payment model: per-case review, monthly retainer, etc.]

11. TERMINATION
    Either party may terminate with 14 days written notice.

Signed: _________________ Date: _________________
```

---

## 7. 图像分析合规（舌象/眼白/皮肤）

### 核心风险

图像分析在美国法律中极易被认定为"诊断行为"（diagnosis）。即使说是"中医"，法律上仍属于 medical assessment。

### 合规判断标准

```
用户看完会觉得"我身体出了什么问题" → ❌ 违法
用户只觉得"我可以调整生活方式"     → ✅ 安全
```

### 舌象分析——禁止 vs 允许

| ❌ 绝对不能说 | ✅ 安全说法 |
|-------------|-----------|
| "你这是湿气重" | "In traditional TCM literature, this coating pattern is often described as being associated with dampness-type constitutional tendencies" |
| "你脾胃不好" | "Traditional perspectives sometimes associate this appearance with digestive comfort patterns" |
| "有炎症/内热" | "Some traditional texts describe this coloration in the context of warmth-type tendencies" |
| "你的肝有问题" | "From a traditional wellness perspective, this pattern is sometimes discussed in educational texts" |
| "肾虚" | "Traditional literature describes this as a cooler constitutional tendency" |

### 关键原则

**不说"你怎么样"，只说"传统文献中这种现象通常如何被描述"。**

主语从 "You have..." 变成 "Traditional texts describe..."——这个转换是合法与违法的分界线。

### 技术实施

已实施在以下文件中：
- `prompts.ts` — TONGUE_ANALYSIS_PROMPT 强制使用 distancing language
- `guardrails.ts` — 拦截 organ-level claims（"your liver", "肝火", "肾虚" 等）
- `guardrails.ts` — 拦截 "you have/are/suffer" 句式

### 上传前强制确认（必须）

用户上传舌象/眼白/皮肤照片前必须确认：

```
This feature provides EDUCATIONAL observations based on traditional 
tongue reading practices. It does NOT provide medical diagnosis, 
health assessment, or disease detection.

☐ I understand this is for educational and lifestyle wellness purposes only.
```

---

## 8. 最优合规架构（核心设计）

### ✅ 正确架构（平台作为中间层）

```
用户提问
  → AI 生成完整草稿（自动化，美国服务器）
  → 平台整理为标准格式
  → Wellness Advisor 审核确认（Portal，只读+一键确认）
  → 平台经 guardrails 净化
  → 输出署名 "Qiorazen Wellness Insight"
  → 用户收到
```

**关键点**：
- 用户看到的是 **"Qiorazen"** 的回复，不是某个医生的回复
- Advisor 是"内容审核者"，不是直接服务提供者
- 平台是"信息整理方"，不是"医疗中介"

### ❌ 错误架构（绝对不能这样）

```
用户 ↔ 医生（直接互动）
```

这会被认定为远程医疗（Telemedicine），触发执照和监管问题。

---

## 9. 内容防火墙

### 禁止输出 ❌

| 类别 | 示例 | 为什么 |
|------|------|--------|
| 疾病诊断 | "You have diabetes" | 非法行医 |
| 具体药物/剂量 | "Take 500mg metformin" | 处方行为 |
| 替代医生 | "You don't need to see a doctor" | 延误治疗责任 |
| 检查建议 | "Get a blood test" | 暗示诊断 |
| 停药建议 | "Stop taking your medication" | 直接干预 |
| 孕妇/儿童 | 针对高风险群体的具体建议 | 高法律风险 |

### 允许输出 ✅

| 类别 | 示例 | 依据 |
|------|------|------|
| 体质分析 | "Your constitution tends toward Qi Deficiency" | 传统分类 |
| 饮食方向 | "Warm, cooked foods may suit your type" | 生活方式 |
| 作息建议 | "Sleeping before 11pm supports your pattern" | 生活习惯 |
| 运动建议 | "Gentle walking after meals suits your type" | 生活方式 |
| 情绪调理 | "Deep breathing may help with tension" | 自我关怀 |
| 茶饮方向 | "Ginger tea is traditionally associated with warmth" | 传统知识 |

### 灰色地带（需要特别措辞）

| 用户问 | ❌ 不能这样答 | ✅ 应该这样答 |
|--------|-------------|-------------|
| "我经常失眠" | "You have insomnia, take melatonin" | "From a TCM wellness perspective, your pattern is traditionally associated with sleep challenges. Calming activities before bed and staying hydrated may help. If difficulties persist, please consult a healthcare professional." |
| "我血压高" | "Your hypertension needs treatment" | "We're not able to provide guidance on specific medical conditions. We recommend consulting your doctor. General wellness practices like stress management may support overall wellbeing." |
| "需要吃什么药？" | 任何药物名称 | "We don't recommend medications. For medication questions, please consult your physician. We can share lifestyle perspectives based on your constitution type." |

---

## 10. 禁用词清单

### 当前已实施（`guardrails.ts`，16 个正则）

diagnose, treat, cure, prevent, prescribe, medication, disease, disorder, illness, pathology, symptom, condition, medical, clinical, therapy, therapeutic

### 需要扩展

**英文**：
```
patient → user / client
doctor → wellness advisor
clinic → platform
prescription → suggestion
dose / dosage → (block)
drug → (block)
side effect → (block)
contraindication → (block)
prognosis → outlook
surgery → (block)
hospital → (only in "go to hospital" emergency redirect)
```

**中文**：
```
患者 → 用户
医生/大夫 → 养生顾问
处方/药方 → 建议
剂量/用量 → （禁止）
具体药名 → （禁止）
副作用 → （禁止）
手术 → （禁止）
化验/检查 → （禁止）
确诊 → （禁止）
```

---

## 11. 支付措辞合规

| ❌ 不用 | ✅ 使用 |
|--------|--------|
| Medical consultation | Wellness insight session |
| Doctor's fee | Advisor review |
| Treatment plan | Wellness guidance plan |
| Unlimited consultations | Ongoing personalized guidance |
| Health assessment | Wellness screening |
| Consultation count | Membership / priority access |

**Stripe 产品名称**：
- `Qiorazen Starter Session`（不是 Medical Consultation）
- `Qiorazen Core Wellness Membership`（不是 Healthcare Subscription）
- `Qiorazen Premium Wellness Advisory`（不是 Medical Advisory）

---

## 12. 跨境风险隔离

### 问题：中国 Wellness Advisor → 美国用户

| 风险 | 规避 |
|------|------|
| 远程医疗认定 | Advisor 不直接接触用户，平台是内容整理方 |
| 无执照行医 | Advisor 是 "wellness content reviewer"，不是 provider |
| 医疗责任 | 合同明确不承担医疗责任 |
| 数据跨境 | 数据在美国，Advisor 通过 Portal 查看不下载 |

### Advisor 对外称呼

| ❌ 不用 | ✅ 使用 |
|--------|--------|
| Doctor / 医生 | Wellness Advisor / 养生顾问 |
| Dr. + 名字 | [名字], TCM Wellness Consultant |
| 中医师 | 中医养生顾问 |
| 诊断 | 体质分析 / 养生建议 |

---

## 13. LLC 注册

- **为什么**：隔离个人资产，即使被起诉个人财产受保护
- **州**：Delaware（最灵活）或 Wyoming（最便宜）
- **类型**：Single-member LLC
- **名称**：Qiorazen LLC
- **费用**：$100-300/年
- **时间**：1-2 周
- **服务**：Northwest / ZenBusiness / LegalZoom

### 保险

- General Liability: $500-1000/年
- Errors & Omissions (E&O): $500-1500/年
- **不需要** Medical Malpractice（因为不是医疗服务）

---

## 14. 紧急症状拦截扩展

当前 `symptom-detector.ts` 有 27 个模式。建议扩展：

```
英文新增:
blood in stool/urine, sudden severe headache, numbness on one side,
slurred speech, severe abdominal pain, high fever (103°F+),
pregnancy + any symptom, infant/baby/child + any symptom

中文新增:
便血/尿血, 突发剧烈头痛, 一侧麻木, 言语不清,
剧烈腹痛, 高烧(39.4°C+), 怀孕+不适, 婴儿/宝宝/孩子+症状
```

检测到后：阻止 AI 处理 → 显示 911/988 → 记录日志。

---

## 15. 立刻要做的 3 件事

### 1. 网站文案最终检查

确认所有页面没有以下词汇：
- ❌ diagnosis / treatment / doctor / patient / prescription
- ✅ wellness insight / lifestyle guidance / wellness advisor

### 2. 产品措辞调整

| 当前 | 改为 |
|------|------|
| "问医生" | "Get wellness insights" |
| "医生回复" | "Advisor-reviewed guidance" |
| "咨询" | "Wellness session" |
| "诊断" | "Constitution analysis" |

### 3. 收费逻辑

- ❌ 按"咨询次数"收费
- ✅ 按 "membership / priority access" 收费
- 当前定价已符合：Starter Session / Core Membership / Premium Advisory

---

## 16. 技术防护总结

| 层 | 文件 | 机制 |
|----|------|------|
| 1 | `prompts.ts` | 系统提示词禁止医疗语言 |
| 2 | `guardrails.ts` | 16 个正则替换禁用词 |
| 3 | `symptom-detector.ts` | 27 个中英文急救拦截 |
| 4 | `disclaimers.ts` | UI 免责声明 |
| 5 | `consent_records` 表 | 不可变同意记录 |
| 6 | RLS policies | 用户只看自己的数据 |
| 7 | Portal 只读设计 | Advisor 不能下载数据 |

---

## 17. 最终检查清单

每条内容到达用户前必须通过：

```
□ 用户已同意免责声明（consent_records 有记录）
□ 用户问题已通过严重症状检测
□ AI 输出已通过禁用词扫描
□ 免责声明已附加在回复底部
□ 回复中没有：诊断、药物、剂量、停药建议
□ 回复中没有使用"doctor/医生"称呼
□ 回复署名是"Qiorazen"而非某个人的名字
```

---

*本文档为内部参考。正式上线前建议请 healthcare attorney 审核（$2,000-5,000）。*
