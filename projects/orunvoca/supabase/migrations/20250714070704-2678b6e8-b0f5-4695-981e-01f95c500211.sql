-- 카드 세트 이미지를 위한 스토리지 버킷 생성
INSERT INTO storage.buckets (id, name, public) VALUES ('card-set-images', 'card-set-images', true);

-- 카드 세트 테이블에 이미지 URL 컬럼 추가
ALTER TABLE card_sets ADD COLUMN image_url TEXT;

-- 카드 세트 이미지에 대한 스토리지 정책 생성
CREATE POLICY "Anyone can view card set images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'card-set-images');

CREATE POLICY "Anyone can upload card set images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'card-set-images');

CREATE POLICY "Anyone can update card set images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'card-set-images');

CREATE POLICY "Anyone can delete card set images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'card-set-images');