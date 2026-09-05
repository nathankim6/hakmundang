
-- Add image_url column to words table
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for word images
INSERT INTO storage.buckets (id, name, public) VALUES ('word-images', 'word-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Word images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'word-images');

-- Allow authenticated users to upload
CREATE POLICY "Anyone can upload word images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'word-images');

-- Allow updates
CREATE POLICY "Anyone can update word images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'word-images');

-- Allow deletes
CREATE POLICY "Anyone can delete word images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'word-images');
