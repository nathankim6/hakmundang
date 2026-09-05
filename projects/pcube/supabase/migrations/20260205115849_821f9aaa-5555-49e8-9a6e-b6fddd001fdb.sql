-- Add logo_url column to schools table
ALTER TABLE public.schools ADD COLUMN logo_url TEXT;

-- Create storage bucket for school logos
INSERT INTO storage.buckets (id, name, public) VALUES ('school-logos', 'school-logos', true);

-- Create storage policies for school logos bucket
CREATE POLICY "School logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'school-logos');

CREATE POLICY "Authenticated users can upload school logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'school-logos');

CREATE POLICY "Authenticated users can update school logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'school-logos');

CREATE POLICY "Authenticated users can delete school logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'school-logos');