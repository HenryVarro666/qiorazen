CREATE TABLE public.practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  specialties TEXT[],
  is_active BOOLEAN DEFAULT true,
  max_daily_cases INTEGER DEFAULT 20,
  cases_reviewed_today INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_practitioner_user ON public.practitioners(user_id);

ALTER TABLE public.practitioners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practitioners read own record"
  ON public.practitioners FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public read active practitioners"
  ON public.practitioners FOR SELECT
  USING (is_active = true);
