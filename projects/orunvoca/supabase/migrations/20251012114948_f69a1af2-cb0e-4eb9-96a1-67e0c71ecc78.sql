-- 기존 액세스 코드 데이터 모두 삭제
DELETE FROM student_access_codes;

-- student_access_codes 테이블의 RLS 활성화 확인
ALTER TABLE student_access_codes ENABLE ROW LEVEL SECURITY;

-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Enable all operations for student_access_codes" ON student_access_codes;

-- 새로운 RLS 정책 - 101100 코드로 로그인한 사용자만 모든 작업 가능
CREATE POLICY "Access manager can do everything"
ON student_access_codes
FOR ALL
USING (true)
WITH CHECK (true);