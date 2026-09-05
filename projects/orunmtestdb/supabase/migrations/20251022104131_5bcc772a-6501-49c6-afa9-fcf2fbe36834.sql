-- Create storage bucket for school logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-logos', 'school-logos', true);

-- Create storage policies for school logos
CREATE POLICY "Anyone can view school logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'school-logos');

CREATE POLICY "Anyone can upload school logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'school-logos');

CREATE POLICY "Anyone can update school logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'school-logos');

CREATE POLICY "Anyone can delete school logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'school-logos');