ALTER TABLE public.report_cards
  ADD COLUMN IF NOT EXISTS original_passages TEXT,
  ADD COLUMN IF NOT EXISTS passage_variants JSONB;