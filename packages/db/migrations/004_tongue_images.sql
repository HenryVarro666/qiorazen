CREATE TABLE public.tongue_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  original_filename TEXT,
  mime_type TEXT NOT NULL,
  file_size_bytes INTEGER,
  analysis_status TEXT DEFAULT 'pending'
    CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  analysis_result JSONB,
  auto_delete_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  consent_record_id UUID REFERENCES public.consent_records(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tongue_user ON public.tongue_images(user_id);
CREATE INDEX idx_tongue_auto_delete ON public.tongue_images(auto_delete_at)
  WHERE deleted_at IS NULL AND auto_delete_at IS NOT NULL;

ALTER TABLE public.tongue_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own tongue images"
  ON public.tongue_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create tongue images"
  ON public.tongue_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own tongue images"
  ON public.tongue_images FOR UPDATE
  USING (auth.uid() = user_id);
