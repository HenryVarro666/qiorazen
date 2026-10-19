# Problem and acceptance

> **Can an AI-assisted wellness drafting workflow produce reviewable, source-consistent text while enforcing access controls and keeping publication subject to human approval?**

**Why it matters:** Fluent generated text can overstate what questionnaire answers support. Users and reviewers need a traceable separation between input, draft, review and released content.

**Central tension:** Personalization encourages specific language, while limited evidence requires restraint. Pattern-based sanitization can catch known phrases but cannot by itself establish factual or medical validity.

**Current evidence and gap:** [CLAUDE.md](CLAUDE.md) describes questionnaire scoring, AI drafting, guardrails, reviewer approval and optional mock services. These are design descriptions, not evidence of clinical efficacy, legal compliance or complete production isolation. [LEGAL_RISK_FRAMEWORK.md](LEGAL_RISK_FRAMEWORK.md) is the repository's stated scope reference.

**Acceptance test:** Use synthetic bilingual inputs to compare draft generation with a fixed template. Have blinded reviewers assess unsupported claims, input consistency and revision effort. Exercise role boundaries, draft visibility, rejected approvals and mock/live configuration transitions using the same cases. Verify that unapproved text remains inaccessible to end users. If text passes phrase filters but remains unsupported, strengthen the review workflow rather than claiming the filter solved validity.

This is engineering acceptance for wellness content handling; no medical benefit is claimed.
