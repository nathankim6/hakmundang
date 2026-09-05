-- Add file_urls column (stores array of JSON objects with name, url, size)
ALTER TABLE public.announcements
ADD COLUMN file_urls jsonb DEFAULT '[]'::jsonb;

-- Create storage bucket for announcement files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('announcement-files', 'announcement-files', true, 524288000)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view announcement files"
ON storage.objects FOR SELECT
USING (bucket_id = 'announcement-files');

CREATE POLICY "Anyone can upload announcement files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'announcement-files');

CREATE POLICY "Anyone can delete announcement files"
ON storage.objects FOR DELETE
USING (bucket_id = 'announcement-files');