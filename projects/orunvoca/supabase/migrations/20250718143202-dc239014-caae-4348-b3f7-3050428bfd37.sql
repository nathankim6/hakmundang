-- Add include_derivatives column to card_sets table
ALTER TABLE public.card_sets ADD COLUMN include_derivatives boolean DEFAULT true;

-- Add comment to explain the column
COMMENT ON COLUMN public.card_sets.include_derivatives IS '시험 시 파생어를 포함할지 여부 (true: 포함, false: 표제어만)';