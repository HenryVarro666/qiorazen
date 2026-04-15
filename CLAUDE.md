# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev                                    # Start all workspaces (Next.js on localhost:3000)
pnpm --filter @qiorazen/web dev             # Start only the web app

# Build
pnpm build                                  # Build all workspaces
pnpm --filter @qiorazen/web build           # Build only web app

# Tests
pnpm --filter @qiorazen/tcm-engine test     # Run scoring engine tests (vitest)
pnpm --filter @qiorazen/tcm-engine test:watch # Watch mode

# Typecheck
pnpm --filter @qiorazen/web typecheck       # Next.js type checking

# Clean stale build cache (fixes "Cannot find module" errors)
rm -rf apps/web/.next && pnpm dev
```

## Architecture

Turborepo monorepo with pnpm workspaces. Three packages feed into one Next.js app.

### Workspace packages

- **`packages/types/`** (`@qiorazen/types`) — Shared TypeScript types for all entities: `ConstitutionType`, `InsightRequest`, `Subscription`, etc.
- **`packages/tcm-engine/`** (`@qiorazen/tcm-engine`) — Pure logic, no framework dependencies. Implements GB/T 46939-2025 national standard scoring: 27 questions, 9 constitution types, exact conversion formula with reverse/dual scoring. This is the most tested package (33 tests).
- **`packages/db/`** (`@qiorazen/db`) — SQL migrations for Supabase (Postgres). 7 tables with RLS policies. Run in order 001-007 via Supabase SQL Editor.
- **`apps/web/`** (`@qiorazen/web`) — Next.js 15 App Router. The only deployable app.

### Key data flow

```
User answers 27 questions → scoreConstitution(answers, gender) → GB/T formula
→ ConstitutionScores (0-100 per type) → getPrimaryConstitution() → result page
```

The scoring engine handles 3 shared questions that are dual-scored (one normal, one reverse into the Balanced scale). Gender routing shows Q19 (female) or Q20 (male) for the Damp-Heat scale.

### Compliance layer (legally critical)

Three files form the compliance guardrails — changes here have legal implications:

- `apps/web/lib/ai/guardrails.ts` — Regex-based banned term scanner. Replaces medical terms (diagnose, treat, cure, etc.) with wellness alternatives in all AI output.
- `apps/web/lib/ai/symptom-detector.ts` — Emergency pattern matching (chest pain, suicidal ideation, etc.) that blocks AI processing and shows 911/988 redirect.
- `apps/web/lib/ai/prompts.ts` — System prompts that prevent Claude from generating medical language.

### i18n

Cookie-based locale detection via `next-intl` (not URL-based). Two files: `messages/en.json` and `messages/zh.json`. Questions are bilingual in the tcm-engine itself (`label.en` / `label.zh`), not in the i18n files.

### Supabase

Optional dependency — the app runs without Supabase configured (middleware skips auth checks when env vars are missing). Auth uses magic link + Google OAuth. All data access goes through RLS policies.

## Brand & Legal

- Product name: **Qiorazen** (not Qiora). Domain: qiorazen.com.
- This is a **wellness platform, NOT medical**. Never use: diagnose, treat, cure, prevent, prescribe, patient, doctor. See `LEGAL_RISK_FRAMEWORK.md`.
- Practitioners are called "Wellness Advisors", never "doctors".
- All AI output must pass through `guardrails.ts` before reaching users.

## Pricing tiers

Entry ($49/request) → Core ($499/mo) → Premium ($1,499/mo) → Transformation ($4,999/yr, invite-only after 3 months). Stripe env vars defined in `.env.example`.
