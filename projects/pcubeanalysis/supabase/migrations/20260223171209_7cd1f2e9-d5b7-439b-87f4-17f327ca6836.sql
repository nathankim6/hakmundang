
CREATE TABLE public.teacher_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_url TEXT NOT NULL,
  teacher_name TEXT NOT NULL DEFAULT 'Pcube 강사',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.teacher_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read teacher_photos_table" ON public.teacher_photos FOR SELECT USING (true);
CREATE POLICY "Allow public insert teacher_photos_table" ON public.teacher_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete teacher_photos_table" ON public.teacher_photos FOR DELETE USING (true);
