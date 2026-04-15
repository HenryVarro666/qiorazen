CREATE TABLE public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'health_data_collection',
    'tongue_image_collection',
    'tongue_image_practitioner_access',
    'ai_processing',
    'terms_of_service',
    'privacy_policy'
  )),
  consent_version TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_consent_user ON public.consent_records(user_id);
CREATE INDEX idx_consent_type ON public.consent_records(user_id, consent_type);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own consent"
  ON public.consent_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create consent"
  ON public.consent_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Consent records are append-only: no UPDATE or DELETE policies
