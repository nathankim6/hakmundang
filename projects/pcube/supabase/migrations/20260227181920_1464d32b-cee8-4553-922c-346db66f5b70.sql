-- Add image_urls column to announcements
ALTER TABLE public.announcements
ADD COLUMN image_urls text[] DEFAULT '{}'::text[];

-- Create storage bucket for announcement images
INSERT INTO storage.buckets (id, name, public)
VALUES ('announcement-images', 'announcement-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view announcement images"
ON storage.objects FOR SELECT
USING (bucket_id = 'announcement-images');

CREATE POLICY "Anyone can upload announcement images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'announcement-images');

CREATE POLICY "Anyone can delete announcement images"
ON storage.objects FOR DELETE
USING (bucket_id = 'announcement-images');