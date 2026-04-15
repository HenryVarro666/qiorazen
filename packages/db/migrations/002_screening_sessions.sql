CREATE TYPE screening_status AS ENUM ('in_progress', 'completed', 'expired');

CREATE TABLE public.screening_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_token TEXT UNIQUE NOT NULL,
  status screening_status NOT NULL DEFAULT 'in_progress',
  answers JSONB NOT NULL DEFAULT '{}',
  constitution_scores JSONB,
  primary_constitution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_screening_user ON public.screening_sessions(user_id);
CREATE INDEX idx_screening_token ON public.screening_sessions(session_token);

ALTER TABLE public.screening_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can create a screening (anonymous or authenticated)
CREATE POLICY "Anyone can create screening"
  ON public.screening_sessions FOR INSERT
  WITH CHECK (true);

-- Users can read their own sessions (by user_id or session_token)
CREATE POLICY "Users read own screenings"
  ON public.screening_sessions FOR SELECT
  USING (
    auth.uid() = user_id
    OR session_token = current_setting('app.session_token', true)
  );

CREATE POLICY "Users update own screenings"
  ON public.screening_sessions FOR UPDATE
  USING (
    auth.uid() = user_id
    OR session_token = current_setting('app.session_token', true)
  );
