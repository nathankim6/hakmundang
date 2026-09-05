ALTER TABLE public.level_test_results ADD COLUMN IF NOT EXISTS test_version text NOT NULL DEFAULT 'v2';
UPDATE public.level_test_results SET test_version = 'v1' WHERE created_at < now();
CREATE INDEX IF NOT EXISTS idx_level_test_results_version ON public.level_test_results(test_version);