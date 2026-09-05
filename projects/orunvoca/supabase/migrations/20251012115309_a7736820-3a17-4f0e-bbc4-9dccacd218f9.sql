-- student_access_codes 테이블 구조 변경
-- 1. 기존 데이터 삭제
DELETE FROM student_access_codes;

-- 2. 컬럼 이름 변경 및 구조 조정
ALTER TABLE student_access_codes 
RENAME COLUMN student_name TO exam_code;

-- 3. class_name 컬럼 제거
ALTER TABLE student_access_codes 
DROP COLUMN IF EXISTS class_name;

-- 4. 최대 동시 접속자 수 컬럼 추가
ALTER TABLE student_access_codes 
ADD COLUMN IF NOT EXISTS max_users integer DEFAULT 500;

-- 5. exam_code를 NOT NULL로 설정
ALTER TABLE student_access_codes 
ALTER COLUMN exam_code SET NOT NULL;