
-- Create storage bucket for teacher photos
INSERT INTO storage.buckets (id, name, public) VALUES ('teacher_photos', 'teacher_photos', true);

-- Allow public access to teacher_photos bucket
CREATE POLICY "Allow public read teacher_photos" ON storage.objects FOR SELECT USING (bucket_id = 'teacher_photos');
CREATE POLICY "Allow public upload teacher_photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'teacher_photos');
CREATE POLICY "Allow public update teacher_photos" ON storage.objects FOR UPDATE USING (bucket_id = 'teacher_photos');
CREATE POLICY "Allow public delete teacher_photos" ON storage.objects FOR DELETE USING (bucket_id = 'teacher_photos');
