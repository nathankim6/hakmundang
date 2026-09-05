
-- Create teacher-photos bucket with hyphen (matching code)
INSERT INTO storage.buckets (id, name, public) VALUES ('teacher-photos', 'teacher-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create report-photos bucket for hit question photos
INSERT INTO storage.buckets (id, name, public) VALUES ('report-photos', 'report-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for teacher-photos
CREATE POLICY "Allow public read teacher-photos" ON storage.objects FOR SELECT USING (bucket_id = 'teacher-photos');
CREATE POLICY "Allow public upload teacher-photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'teacher-photos');
CREATE POLICY "Allow public update teacher-photos" ON storage.objects FOR UPDATE USING (bucket_id = 'teacher-photos');
CREATE POLICY "Allow public delete teacher-photos" ON storage.objects FOR DELETE USING (bucket_id = 'teacher-photos');

-- Policies for report-photos
CREATE POLICY "Allow public read report-photos" ON storage.objects FOR SELECT USING (bucket_id = 'report-photos');
CREATE POLICY "Allow public upload report-photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'report-photos');
CREATE POLICY "Allow public update report-photos" ON storage.objects FOR UPDATE USING (bucket_id = 'report-photos');
CREATE POLICY "Allow public delete report-photos" ON storage.objects FOR DELETE USING (bucket_id = 'report-photos');
