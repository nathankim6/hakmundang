
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_settings public read" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "app_settings public write" ON public.app_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "app_settings public update" ON public.app_settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "app_settings public delete" ON public.app_settings FOR DELETE USING (true);
