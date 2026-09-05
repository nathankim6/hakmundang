
CREATE TABLE public.study_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  period_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.study_photos TO authenticated;
GRANT ALL ON public.study_photos TO service_role;

ALTER TABLE public.study_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photos viewable by authenticated"
ON public.study_photos FOR SELECT TO authenticated USING (true);

CREATE POLICY "Insert own photos"
ON public.study_photos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Delete own photos"
ON public.study_photos FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_study_photos_created_at ON public.study_photos (created_at DESC);
CREATE INDEX idx_study_photos_user ON public.study_photos (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_study_photo_period()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.period_id IS NULL THEN
    NEW.period_id := public.exam_period_for_date((NEW.created_at AT TIME ZONE 'Asia/Seoul')::date);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_study_photo_period
BEFORE INSERT ON public.study_photos
FOR EACH ROW EXECUTE FUNCTION public.set_study_photo_period();

INSERT INTO storage.buckets (id, name, public)
VALUES ('study-photos', 'study-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Study photos public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'study-photos');

CREATE POLICY "Users upload own study photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'study-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own study photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'study-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
