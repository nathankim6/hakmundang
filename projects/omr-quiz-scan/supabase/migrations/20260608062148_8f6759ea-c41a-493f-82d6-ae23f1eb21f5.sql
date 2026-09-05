ALTER TABLE public.level_test_results ADD COLUMN IF NOT EXISTS academy text NOT NULL DEFAULT 'orun';
ALTER TABLE public.access_codes ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'full';
ALTER TABLE public.access_codes ADD COLUMN IF NOT EXISTS academy text NOT NULL DEFAULT 'orun';
INSERT INTO public.access_codes (code, name, user_name, expiry_date, scope, academy, is_admin)
VALUES ('brainiac', 'Brainiac Academy', '브래니악 학원', now() + interval '10 years', 'levelTestOnly', 'brainiac', false)
ON CONFLICT (code) DO UPDATE SET scope = EXCLUDED.scope, academy = EXCLUDED.academy, expiry_date = EXCLUDED.expiry_date, name = EXCLUDED.name, user_name = EXCLUDED.user_name;