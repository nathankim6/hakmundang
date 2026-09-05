-- Create storage bucket for survey media
INSERT INTO storage.buckets (id, name, public)
VALUES ('survey-media', 'survey-media', true);

-- Add media_url column to survey_questions
ALTER TABLE public.survey_questions
ADD COLUMN media_url TEXT;

-- Storage policies for survey media
CREATE POLICY "Anyone can view survey media"
ON storage.objects FOR SELECT
USING (bucket_id = 'survey-media');

CREATE POLICY "Authenticated users can upload survey media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'survey-media' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their survey media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'survey-media'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their survey media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'survey-media'
  AND auth.role() = 'authenticated'
);