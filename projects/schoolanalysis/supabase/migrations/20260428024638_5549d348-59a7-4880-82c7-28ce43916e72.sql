ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS region TEXT NOT NULL DEFAULT 'dongjak';

UPDATE public.reports
SET region = 'dongjak'
WHERE region IS NULL;

CREATE INDEX IF NOT EXISTS idx_reports_region_updated_at
ON public.reports (region, updated_at DESC);