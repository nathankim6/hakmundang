-- 기존 student_access_codes 테이블 구조 변경
-- 1. student_id를 nullable로 변경하고 외래 키 제약 조건 제거
ALTER TABLE student_access_codes 
DROP CONSTRAINT IF EXISTS student_access_codes_student_id_fkey;

ALTER TABLE student_access_codes 
ALTER COLUMN student_id DROP NOT NULL;

-- 2. 유효기간 컬럼 추가
ALTER TABLE student_access_codes 
ADD COLUMN IF NOT EXISTS expiry_date timestamp with time zone;

-- 3. 학생 이름과 반 정보를 직접 저장할 컬럼 추가
ALTER TABLE student_access_codes 
ADD COLUMN IF NOT EXISTS student_name text,
ADD COLUMN IF NOT EXISTS class_name text;

-- 4. 자동 생성 트리거 비활성화
DROP TRIGGER IF EXISTS create_student_access_code ON students;
DROP TRIGGER IF EXISTS delete_student_access_code ON students;

-- 5. RLS 정책 업데이트 (모든 작업 허용)
DROP POLICY IF EXISTS "Enable all operations for student_access_codes" ON student_access_codes;

CREATE POLICY "Enable all operations for student_access_codes"
ON student_access_codes
FOR ALL
USING (true)
WITH CHECK (true);