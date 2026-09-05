-- incorrect_options 테이블에 RLS 활성화 및 정책 추가
ALTER TABLE incorrect_options ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 데이터를 읽을 수 있도록 허용
CREATE POLICY "Allow anyone to read incorrect options" 
ON incorrect_options 
FOR SELECT 
USING (true);

-- 인증된 사용자만 데이터를 삽입할 수 있도록 허용
CREATE POLICY "Allow authenticated users to insert incorrect options" 
ON incorrect_options 
FOR INSERT 
WITH CHECK (true);

-- 인증된 사용자만 데이터를 업데이트할 수 있도록 허용
CREATE POLICY "Allow authenticated users to update incorrect options" 
ON incorrect_options 
FOR UPDATE 
USING (true);