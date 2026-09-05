-- Add storage policies for daily-word-photos bucket to allow uploads
CREATE POLICY "Anyone can upload daily word photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'daily-word-photos');

CREATE POLICY "Anyone can update daily word photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'daily-word-photos');

CREATE POLICY "Anyone can delete daily word photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'daily-word-photos');

-- Also ensure daily-submissions bucket has proper policies
CREATE POLICY "Anyone can upload daily submissions"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'daily-submissions');

CREATE POLICY "Anyone can update daily submissions"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'daily-submissions');

CREATE POLICY "Anyone can delete daily submissions"
ON storage.objects
FOR DELETE
USING (bucket_id = 'daily-submissions');