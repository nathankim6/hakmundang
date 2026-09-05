ALTER TABLE public.report_cards
  ADD COLUMN IF NOT EXISTS exam_features jsonb,
  ADD COLUMN IF NOT EXISTS killer_top5 jsonb;