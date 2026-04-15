CREATE TYPE insight_status AS ENUM (
  'pending_payment',
  'paid',
  'ai_processing',
  'ai_complete',
  'practitioner_pending',
  'practitioner_approved',
  'delivered',
  'refunded'
);

CREATE TABLE public.insight_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  screening_session_id UUID REFERENCES public.screening_sessions(id),
  tongue_image_id UUID REFERENCES public.tongue_images(id),
  status insight_status NOT NULL DEFAULT 'pending_payment',
  tier TEXT NOT NULL DEFAULT 'entry' CHECK (tier IN ('entry', 'core', 'premium', 'elite')),
  user_questions TEXT[] NOT NULL DEFAULT '{}',

  -- AI output
  ai_draft JSONB,
  ai_wellness_insight TEXT,
  ai_constitution_summary TEXT,
  ai_lifestyle_suggestions JSONB,

  -- Practitioner review
  practitioner_id UUID REFERENCES public.practitioners(id),
  practitioner_notes TEXT,
  practitioner_reviewed_at TIMESTAMPTZ,
  practitioner_approved_at TIMESTAMPTZ,

  -- Final output
  final_insight TEXT,
  disclaimer_version TEXT NOT NULL DEFAULT 'v1.0',

  -- Payment
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'usd',
  is_subscription_use BOOLEAN DEFAULT false,

  -- SLA
  response_deadline TIMESTAMPTZ,

  -- Compliance
  serious_symptom_detected BOOLEAN DEFAULT false,
  emergency_redirect_shown BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_insight_user ON public.insight_requests(user_id);
CREATE INDEX idx_insight_status ON public.insight_requests(status);
CREATE INDEX idx_insight_practitioner ON public.insight_requests(practitioner_id)
  WHERE practitioner_id IS NOT NULL;
CREATE INDEX idx_insight_deadline ON public.insight_requests(response_deadline)
  WHERE status IN ('ai_complete', 'practitioner_pending');

ALTER TABLE public.insight_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own insights"
  ON public.insight_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create insights"
  ON public.insight_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Practitioners can read cases pending review or already reviewed
CREATE POLICY "Practitioners read review cases"
  ON public.insight_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.practitioners p
      WHERE p.user_id = auth.uid() AND p.is_active = true
    )
    AND status IN ('practitioner_pending', 'practitioner_approved', 'delivered')
  );

-- Practitioners can update cases pending review
CREATE POLICY "Practitioners update review cases"
  ON public.insight_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.practitioners p
      WHERE p.user_id = auth.uid() AND p.is_active = true
    )
    AND status = 'practitioner_pending'
  );

CREATE TRIGGER insight_requests_updated_at
  BEFORE UPDATE ON public.insight_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
