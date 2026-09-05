-- 녹음 파일 저장용 스토리지 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('rt-recordings', 'rt-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- 녹음 파일 읽기 정책
CREATE POLICY "Anyone can view recordings"
ON storage.objects FOR SELECT
USING (bucket_id = 'rt-recordings');

-- 녹음 파일 업로드 정책
CREATE POLICY "Anyone can upload recordings"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'rt-recordings');

-- 녹음 파일 삭제 정책
CREATE POLICY "Anyone can delete their recordings"
ON storage.objects FOR DELETE
USING (bucket_id = 'rt-recordings');