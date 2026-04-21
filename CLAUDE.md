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
pnpm --filter @qiorazen/tcm-engine test     # Run scoring engine tests (vitest, 33 tests)
pnpm --filter @qiorazen/tcm-engine test:watch # Watch mode

# Typecheck
pnpm --filter @qiorazen/web typecheck       # Next.js type checking

# Clean stale build cache (fixes "Cannot find module" errors)
rm -rf apps/web/.next && pnpm dev

# Deploy (auto-deploys on push)
git push origin main                        # Vercel builds automatically
```

## Architecture

Turborepo monorepo with pnpm workspaces. Three packages feed into one Next.js 15 app.

### Workspace packages

- **`packages/types/`** (`@qiorazen/types`) — Shared TypeScript types: `ConstitutionType`, `ConstitutionScores`, `InsightRequest`, `Subscription`, etc.
- **`packages/tcm-engine/`** (`@qiorazen/tcm-engine`) — Pure logic, no framework dependencies. Implements GB/T 46939-2025 national standard scoring: 27 questions, 9 constitution types, exact conversion formula with reverse/dual scoring.
- **`packages/db/`** (`@qiorazen/db`) — SQL migrations (001-007) for Supabase (Postgres). 8 tables with RLS policies. `scripts/admin.sql` has common admin queries.
- **`apps/web/`** (`@qiorazen/web`) — Next.js 15 App Router. The only deployable app. Deployed to Vercel at qiorazen.com.

### Route groups

- `(public)` — Landing page, screening, terms, privacy. No auth required.
- `(auth)` — Login page with Google OAuth + email magic link. Phone OTP + Apple ID coded but commented out pending configuration.
- `(dashboard)` — User-facing: dashboard home, screening history (`/screenings`), submit questions (`/insights/new`), insight detail (`/insights/[id]`).
- `(practitioner)` — Advisor portal: dashboard with stats, case queue, case review with AI-assisted compliance check + translation + note polishing.

### Key data flows

**Screening flow:**
```
Gender select → 27 questions → scoreConstitution(answers, gender) → GB/T formula
→ ConstitutionScores (0-100) → getPrimaryConstitution() → result page with radar chart
→ POST /api/screening → save to DB + localStorage
```
3 shared questions are dual-scored (normal + reverse into Balanced scale). Gender routing: Q19 (female) / Q20 (male) for Damp-Heat.

**Insight flow (question submission):**
```
User submits 1-3 questions → POST /api/insights:
  1. symptom-detector pre-check (blocks emergency cases with 911/988)
  2. Auth check (single createClient, reused throughout)
  3. Payment gate: verify subscription daily limit OR one-time credit
  4. Load screening data from session
  5. AI generates draft via Claude API
  6. guardrails sanitization
  7. Save to insight_requests (status: practitioner_pending)
  8. Link one-time payment credit to prevent reuse
→ Advisor reviews in /portal → approve → user sees result in /insights/[id]
```

**Payment flow:**
```
/insights/new payment gate → POST /api/payments/checkout → Stripe Checkout
→ success redirect with {CHECKOUT_SESSION_ID} → POST /api/payments/verify
→ verify with Stripe API + record in payments table → grant access
→ webhook (production) handles subscription lifecycle events
```
Mock mode: when `STRIPE_SECRET_KEY` is not set, checkout returns mock redirect URL. Payment gate is skipped when Stripe is not configured.

### API routes (15 endpoints)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/callback` | GET | OAuth/magic link callback, links screening sessions |
| `/api/screening` | POST | Save screening results |
| `/api/screening/latest` | GET | User's most recent screening |
| `/api/screening/history` | GET | All screening sessions for user |
| `/api/insights` | GET/POST | List user's insights / Submit new questions |
| `/api/insights/[id]` | GET | Single insight detail |
| `/api/payments/checkout` | POST | Create Stripe checkout session |
| `/api/payments/status` | GET | Check user's payment/subscription status |
| `/api/payments/verify` | POST | Verify Stripe checkout + record payment |
| `/api/payments/webhook` | POST | Stripe webhook handler |
| `/api/practitioner/check` | GET | Check if user is active practitioner |
| `/api/practitioner/cases` | GET | List pending cases (practitioner only) |
| `/api/practitioner/cases/[id]` | GET | Single case detail (practitioner only) |
| `/api/practitioner/cases/[id]/approve` | POST | Approve case with optional notes |
| `/api/ai/assist` | POST | AI helper: summarize, translate, compliance check, polish |

### AI pipeline (`apps/web/lib/ai/`)

- `client.ts` — `generateWellnessInsight()` and `analyzeTongueImage()`. Falls back to mock responses when `ANTHROPIC_API_KEY` is not set.
- `prompts.ts` — System prompts with strict compliance rules. Tongue analysis uses distancing language ("traditional texts describe..." not "you have...").
- `guardrails.ts` — 42 regex patterns replacing banned medical/organ-level terms in AI output. Both EN and ZH patterns. Returns `{ sanitizedText, violations, hasCriticalViolation }`.
- `symptom-detector.ts` — 40+ emergency patterns (EN+ZH) that block AI processing and show 911/988 redirect.

### Compliance layer (legally critical)

Changes to these files have legal implications. See `LEGAL_RISK_FRAMEWORK.md` for full context.

- **Never use**: diagnose, treat, cure, prevent, prescribe, patient, doctor, or organ-level claims ("your liver is weak")
- **Always use**: wellness insight, lifestyle guidance, traditional perspectives, constitutional tendency
- All AI output passes through `guardrails.ts` before reaching users
- Advisor notes also pass through guardrails; violations are reported back to the advisor
- Practitioners are "Wellness Advisors", never "doctors"
- User sees "Qiorazen Wellness Insight" as the source, never an individual advisor's name
- Emergency symptoms (chest pain, suicidal ideation, etc.) block the entire submission form, not just show a warning

### Security model

- **Payment gate**: `/api/insights` POST validates subscription (daily limit + counter increment) or one-time payment credit before processing. One-time credits are linked to the insight to prevent reuse.
- **Tier validation**: Server-side only. Client-provided `tier` parameter is ignored; actual tier is read from `subscriptions` table.
- **Practitioner auth**: API routes verify practitioner role via `practitioners` table. Approve endpoint uses `createServiceClient()` (service role) to bypass RLS for status updates.
- **RLS**: All tables have Row Level Security. Users can only read their own data. Practitioners can read/update cases in specific statuses.
- **Auth callback**: Links unlinked screening sessions to user account after login (by session ID from URL or most recent null-user session).

### i18n

Cookie-based locale via `next-intl` (not URL-based). `messages/en.json` and `messages/zh.json`. Questions are bilingual in tcm-engine (`label.en` / `label.zh`). Most UI components use `useLocale()` with inline ternaries for bilingual text.

### External services

All optional — the app runs fully without any keys configured (mock mode):

- **Supabase** — Auth (magic link + Google OAuth) + Postgres + Storage. Middleware skips auth when not configured.
- **Stripe** — Payments. Returns mock checkout URL when not configured. Payment gate skipped in mock mode.
- **Anthropic** — Claude API for wellness insights, tongue analysis, and AI assist features. Returns mock responses when not configured.

## Brand & Legal

- Product name: **Qiorazen**. Domain: qiorazen.com.
- This is a **wellness platform, NOT medical**. See `LEGAL_RISK_FRAMEWORK.md` (17 sections).
- Pricing: Starter Session ($49) → Core ($499/mo) → Premium ($1,499/mo) → Transformation ($4,999/yr, invite-only after 3+ months Premium).
- Stripe products must be named "Qiorazen [Tier] Wellness [Type]" — never use "medical", "consultation", or "doctor" in Stripe product names.
