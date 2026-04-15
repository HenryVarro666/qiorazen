# Qiorazen 法律风险规避框架
# Legal Risk Mitigation Framework

---

## 核心定位（一句话，所有人必须背下来）

> **"We provide AI-assisted wellness insights based on traditional practices for lifestyle improvement, not medical care."**
>
> **"我们提供基于传统养生理念的 AI 辅助健康生活方式建议，而非医疗服务。"**

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

### 未实施 ❌（上线前必须完成）

| 防护层 | 优先级 | 说明 |
|-------|--------|------|
| 注册前强制同意免责声明 | 🔴 P0 | 用户必须勾选 3 个复选框才能使用 |
| 每次咨询前弹窗确认 | 🔴 P0 | "Is this an emergency? → Call 911" |
| Terms of Service 页面 | 🔴 P0 | 法律基础 |
| Privacy Policy 页面 | 🔴 P0 | 数据合规基础 |
| 医生合同（Independent Contractor） | 🔴 P0 | 明确不提供医疗服务 |
| 回复自动附加免责声明 | 🟡 P1 | 每条 AI+医生回复底部 |
| 内容防火墙（禁止输出清单） | 🟡 P1 | 扩展 guardrails |
| LLC 注册 | 🟡 P1 | 隔离个人责任 |
| 同意记录审计日志 | 🟢 P2 | consent_records 表已设计 |
| 数据删除请求流程 | 🟢 P2 | GDPR/CCPA 合规 |

---

## 2. 三层免责声明体系

### Layer 1: 注册/首次使用前（最关键）

用户必须逐一勾选以下 3 个复选框，缺一不可：

```
☐ I understand that Qiorazen is NOT a medical service. 
  It does not diagnose, treat, cure, or prevent any disease or medical condition.
  我理解 Qiorazen 不是医疗服务，不提供疾病诊断、治疗、药方或预防。

☐ I understand that the wellness insights provided are NOT a substitute 
  for professional medical advice from a licensed physician.
  我理解本平台提供的养生建议不能替代持证医生的专业医疗建议。

☐ I agree that I am using this service for educational and lifestyle 
  wellness purposes only, and I assume full responsibility for my health decisions.
  我同意仅将本服务用于教育和生活方式养生目的，并对自己的健康决策承担全部责任。
```

**技术实现**：`consent_records` 表记录每个用户的同意时间戳、IP、浏览器。

### Layer 2: 每次提交咨询前

弹窗确认（不可跳过）：

```
⚠️ Before you continue:

Are you experiencing any of the following?
- Chest pain or difficulty breathing
- Severe bleeding or injury
- Thoughts of self-harm or suicide
- Loss of consciousness or seizures
- Any other medical emergency

→ If YES: Please call 911 immediately or go to your nearest emergency room.

→ If NO: [Continue to submit your question]

Reminder: Qiorazen provides lifestyle wellness guidance only. 
We do not diagnose or treat medical conditions.
```

### Layer 3: 每条回复自动附加

所有 AI 生成 + 医生审核的回复底部自动附加：

```
─────────────────────────
This is general wellness and lifestyle guidance based on Traditional Chinese Medicine 
concepts. It is provided for educational purposes only and is NOT medical advice, 
diagnosis, or treatment. Always consult a licensed healthcare professional for 
medical concerns. If you are experiencing a medical emergency, call 911.
─────────────────────────
```

---

## 3. 内容防火墙：禁止 vs 允许

### 绝对禁止输出 ❌

| 类别 | 示例 | 为什么禁止 |
|------|------|-----------|
| 疾病诊断 | "You have diabetes" / "这是糖尿病" | 构成非法行医 |
| 具体药物/剂量 | "Take 500mg of metformin" / "吃二甲双胍" | 构成处方行为 |
| 替代医生建议 | "You don't need to see a doctor" | 延误治疗的法律责任 |
| 检查/检验建议 | "You should get a blood test" | 暗示诊断行为 |
| 特定疾病关联 | "Your constitution causes heart disease" | 因果声明 = 诊断 |
| 停药建议 | "You can stop taking your medication" | 直接医疗干预 |
| 怀孕/儿童建议 | 任何针对孕妇或儿童的具体建议 | 高风险群体 |

### 允许输出 ✅

| 类别 | 示例 | 合规依据 |
|------|------|---------|
| 体质分析 | "Your constitution tends toward Qi Deficiency" | 传统体系的分类，非疾病诊断 |
| 饮食习惯建议 | "Warm, cooked foods may feel better for your type" | 生活方式建议 |
| 作息建议 | "Sleeping before 11pm supports your constitution" | 生活习惯 |
| 运动建议 | "Gentle walking after meals suits your pattern" | 生活方式 |
| 情绪调理 | "Deep breathing may help with your tendency toward anxiety" | 自我关怀 |
| 季节养生 | "Your type may feel less comfortable in winter" | 教育信息 |
| 茶饮/食疗方向 | "Ginger tea is traditionally associated with warmth" | 传统知识分享 |

### 灰色地带（需要特别措辞）

| 用户问 | ❌ 不能这样回答 | ✅ 应该这样回答 |
|--------|--------------|--------------|
| "我经常失眠怎么办？" | "You have insomnia, take melatonin" | "From a TCM wellness perspective, your Yin Deficiency pattern is traditionally associated with sleep challenges. You might consider calming activities before bed and staying hydrated. If sleep difficulties persist, please consult a healthcare professional." |
| "我血压高" | "Your hypertension needs treatment" | "We're not able to provide guidance on specific medical conditions like blood pressure. We recommend consulting your doctor. In the meantime, general wellness practices like stress management and balanced eating may support overall wellbeing." |
| "需要吃什么药？" | 任何药物名称 | "We don't recommend medications. For any medication questions, please consult your physician or pharmacist. We can share lifestyle and dietary perspectives based on your constitution type." |

---

## 4. 禁用词扩展清单

当前 `guardrails.ts` 有 16 个正则。建议扩展以下禁用词：

### 新增禁用词（英文）

```
patient → client / user
doctor → wellness advisor / consultant
clinic → platform
prescription → suggestion
dose / dosage → (block entirely)
drug → (block entirely)
side effect → (block entirely)
contraindication → (block entirely)
prognosis → outlook / tendency
chronic → ongoing / long-term
acute → immediate / sudden
surgery → (block entirely)
hospital → healthcare facility (in redirect context only)
```

### 新增禁用词（中文）

```
患者 → 用户
医生/大夫 → 养生顾问
处方/药方 → 建议
剂量/用量 → （完全禁止）
西药/中药 + 具体药名 → （完全禁止）
副作用 → （完全禁止）
手术 → （完全禁止）
化验/检查 → （完全禁止）
确诊 → （完全禁止）
```

---

## 5. 医生（Wellness Advisor）合同要点

### 对外称呼

| ❌ 不用 | ✅ 使用 |
|--------|--------|
| Doctor / 医生 | Wellness Advisor / 养生顾问 |
| Dr. + 名字 | [名字], TCM Wellness Consultant |
| 中医师 | 中医养生顾问 |
| 诊断 | 体质分析 / 养生建议 |

### Independent Contractor Agreement 核心条款

```
1. NATURE OF SERVICES
   Contractor provides general wellness and lifestyle guidance based on 
   Traditional Chinese Medicine concepts. Contractor does NOT provide:
   - Medical diagnosis
   - Medical treatment
   - Prescription of medications
   - Advice to discontinue medical treatment

2. NO DOCTOR-PATIENT RELATIONSHIP
   No doctor-patient or provider-patient relationship is created between 
   Contractor and any user of the Platform.

3. SCOPE LIMITATIONS
   Contractor agrees to:
   - Review AI-generated wellness drafts only
   - Add only lifestyle and wellness commentary
   - Flag and escalate any user presenting emergency symptoms
   - Never recommend specific medications or dosages
   - Never diagnose or claim to diagnose any medical condition

4. INDEMNIFICATION
   Contractor indemnifies Platform against any claims arising from 
   Contractor's deviation from the approved scope of services.

5. CONTENT REVIEW
   All Contractor outputs are subject to automated compliance review 
   (guardrails) before delivery to users. Platform reserves the right 
   to modify or block non-compliant content.

6. LICENSING DISCLAIMER
   Contractor acknowledges that they are not licensed to practice medicine 
   in any U.S. state and are not providing medical services through the Platform.
```

---

## 6. Terms of Service 核心条款

### 关键条款（必须包含）

```
1. SERVICE DESCRIPTION
   Qiorazen is an AI-powered wellness insight platform that provides 
   lifestyle guidance inspired by Traditional Chinese Medicine (TCM) concepts. 
   Qiorazen is NOT a medical service, telemedicine platform, or healthcare provider.

2. NO MEDICAL ADVICE
   Nothing on this platform constitutes medical advice, diagnosis, or treatment. 
   All content is for educational and informational purposes only.

3. NO PROVIDER-PATIENT RELATIONSHIP
   Use of Qiorazen does not create a doctor-patient, provider-patient, or any 
   other healthcare relationship between you and Qiorazen or its consultants.

4. USER RESPONSIBILITY
   You are solely responsible for your health decisions. You agree to consult 
   a licensed healthcare professional for any medical concerns, symptoms, 
   or conditions.

5. EMERGENCY DISCLAIMER
   Qiorazen is NOT an emergency service. If you are experiencing a medical 
   emergency, call 911 (or your local emergency number) immediately.

6. CONSULTANT QUALIFICATIONS
   Wellness consultants on the platform provide insights based on traditional 
   wellness concepts. They may not hold medical licenses in your jurisdiction 
   and are not acting as licensed healthcare providers.

7. LIMITATION OF LIABILITY
   Qiorazen shall not be liable for any harm, injury, or adverse outcome 
   resulting from:
   (a) Reliance on wellness insights provided through the platform
   (b) Delayed seeking of medical care
   (c) Any health decisions made based on platform content
   Maximum liability shall not exceed the amount paid for the specific service.

8. ARBITRATION
   Any disputes shall be resolved through binding arbitration in [State], 
   not through court proceedings.

9. CONTENT OWNERSHIP
   Qiorazen retains the right to use anonymized, de-identified data for 
   platform improvement. Personal health data will never be sold to third parties.

10. TERMINATION
    Qiorazen reserves the right to terminate service to any user who:
    - Uses the platform for emergency medical situations
    - Repeatedly seeks medical diagnosis or treatment
    - Violates these Terms of Service
```

---

## 7. Privacy Policy 核心条款

```
1. DATA WE COLLECT
   - Account information (email, name)
   - Screening questionnaire responses
   - Constitution assessment results
   - Questions submitted for wellness guidance
   - Tongue images (if voluntarily uploaded)
   - Usage data and analytics

2. HOW WE USE YOUR DATA
   - To provide personalized wellness insights
   - To facilitate wellness advisor review
   - To improve our AI models (anonymized only, with consent)
   - We NEVER sell personal health data to third parties

3. DATA STORAGE
   - All data stored on U.S.-based servers
   - Encrypted at rest and in transit
   - No data transferred to international servers

4. YOUR RIGHTS
   - Access: Request a copy of all your data
   - Deletion: Request complete deletion of your account and data
   - Portability: Export your data in standard format
   - Opt-out: Withdraw consent for data processing at any time

5. TONGUE IMAGES
   - Stored in encrypted private storage
   - Accessible only to your assigned wellness advisor
   - Auto-deleted after 90 days (configurable)
   - Never used for facial recognition or shared externally

6. BREACH NOTIFICATION
   In the event of unauthorized access to health-related data, we will 
   notify affected users within 60 days per FTC Health Breach Notification Rule.

7. NOT HIPAA COVERED
   Qiorazen is a wellness platform, not a covered entity under HIPAA. 
   We implement strong security practices but do not claim HIPAA compliance.

8. CALIFORNIA RESIDENTS (CCPA)
   California residents have additional rights under CCPA including the 
   right to know, delete, and opt-out of data sale (we do not sell data).
```

---

## 8. 跨境风险隔离

### 问题：中国医生 → 美国用户

| 风险 | 规避措施 |
|------|---------|
| 被认定为远程医疗 | 医生从不直接接触用户。平台作为"内容整理方" |
| 无执照行医 | 医生是 "wellness content reviewer"，不是 provider |
| 医疗责任 | 合同明确：不承担医疗责任 |
| 数据跨境 | 所有数据在美国。医生通过 portal 访问，不下载 |

### 信息流（合规设计）

```
用户提问
  → AI 生成完整草稿（美国服务器）
  → 医生通过 Portal 查看（只读 + 审核）
  → 医生点击"确认" 或 添加一句备注
  → 平台将最终内容经 guardrails 净化
  → 用户收到 "Qiorazen Wellness Insight"（不是 "Dr. X's response"）
```

**关键**：用户看到的是 "Qiorazen" 的回复，不是某个医生的回复。医生是内容审核者，不是直接服务提供者。

---

## 9. 支付措辞合规

| ❌ 不用 | ✅ 使用 |
|--------|--------|
| Medical consultation fee | Wellness insight session |
| Doctor's fee | Advisor review |
| Treatment plan | Wellness guidance plan |
| Unlimited consultations | Ongoing personalized guidance |
| Health assessment | Wellness screening |

Stripe 产品名称建议：
- `Qiorazen Starter Session` (not "Medical Consultation")
- `Qiorazen Core Wellness Membership` (not "Healthcare Subscription")
- `Qiorazen Premium Wellness Advisory` (not "Medical Advisory")

---

## 10. 紧急症状拦截扩展

当前 `symptom-detector.ts` 有 27 个模式。建议扩展：

### 新增检测模式

```
英文:
- blood in stool/urine
- sudden severe headache
- numbness on one side
- slurred speech
- severe abdominal pain
- high fever (over 103°F / 39.4°C)
- pregnancy complications
- infant/baby/child + any symptom

中文:
- 便血/尿血
- 突发剧烈头痛
- 一侧麻木
- 言语不清
- 剧烈腹痛
- 高烧（39.4°C以上）
- 怀孕 + 任何不适
- 婴儿/宝宝/孩子 + 任何症状
```

### 拦截行为

检测到以上任何内容时：
1. **立即阻止** AI 处理
2. 显示紧急转介页面（911 / 988 / 当地急诊）
3. **记录日志**（保护平台免责）
4. 不退款（ToS 中明确）

---

## 11. LLC 注册建议

### 为什么需要

- 隔离个人资产和公司负债
- 即使被起诉，个人财产受保护
- 美国运营任何有责任风险的业务的标准做法

### 推荐

- **州**: Delaware（最灵活）或 Wyoming（最便宜）
- **类型**: Single-member LLC
- **名称**: Qiorazen LLC
- **注册代理**: 使用 Registered Agent 服务（如 Northwest, ZenBusiness）
- **费用**: $100-300/年
- **时间**: 1-2 周

### 需要的保险

- **General Liability Insurance**: $500-1000/年
- **Errors & Omissions (E&O)**: $500-1500/年
- **不需要** Medical Malpractice Insurance（因为不是医疗服务）

---

## 12. 实施优先级

### 🔴 第一阶段：现在就做（上线前）

- [ ] 更新 disclaimers.ts — 已完成品牌名更新
- [ ] 创建 Terms of Service 页面 (`/terms`)
- [ ] 创建 Privacy Policy 页面 (`/privacy`)
- [ ] 注册前强制 3 个同意复选框
- [ ] 扩展 guardrails.ts 禁用词

### 🟡 第二阶段：付费功能上线前

- [ ] 每次咨询前弹窗确认
- [ ] 回复自动附加免责声明
- [ ] 医生 Independent Contractor Agreement
- [ ] Stripe 产品名称合规化
- [ ] 扩展 symptom-detector.ts

### 🟢 第三阶段：规模化前

- [ ] LLC 注册
- [ ] General Liability + E&O 保险
- [ ] Healthcare attorney 审核（$2,000-5,000）
- [ ] 同意记录审计系统
- [ ] 数据删除请求流程
- [ ] CCPA 合规

---

## 13. 已实施的技术防护总结

| 防护 | 文件 | 机制 |
|------|------|------|
| AI 输出净化 | `guardrails.ts` | 16 个正则替换禁用词 |
| 系统提示词 | `prompts.ts` | 明确禁止医疗语言 |
| 急救拦截 | `symptom-detector.ts` | 27 个中英文模式匹配 |
| UI 免责 | `disclaimers.ts` | banner + footer 双层 |
| 数据库同意记录 | `003_consent_records.sql` | 不可变追溯记录 |
| RLS 数据隔离 | `006-007 migrations` | 用户只能看自己的数据 |
| 医生访问限制 | `006 RLS policies` | 只能看待审核案例 |

---

## 14. 最终检查清单

在任何内容到达用户之前，必须通过以下检查：

```
□ 1. 用户已同意免责声明（consent_records 有记录）
□ 2. 用户问题已通过严重症状检测（symptom-detector）
□ 3. AI 输出已通过禁用词扫描（guardrails）
□ 4. 免责声明已附加在回复底部
□ 5. 回复中没有：诊断、药物、剂量、停药建议
□ 6. 回复中没有使用"doctor/医生"称呼
□ 7. 回复署名是"Qiorazen"而非某个医生的名字
```

---

*本文档为内部参考文档，不构成法律建议。正式上线前建议请 healthcare attorney 审核所有法律文本。*
