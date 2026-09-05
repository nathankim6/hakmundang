-- access_codes 테이블에 역할 추가 (admin, teacher, student)
ALTER TABLE public.access_codes 
ADD COLUMN role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher', 'student'));

-- 기존 관리자 코드 업데이트
UPDATE public.access_codes SET role = 'admin' WHERE is_admin = true;

-- 학생 테이블에 access_code 연결 추가
ALTER TABLE public.students
ADD COLUMN access_code_id UUID REFERENCES public.access_codes(id) ON DELETE SET NULL;

-- homework 테이블의 type 체크 제약조건 변경
ALTER TABLE public.homework DROP CONSTRAINT IF EXISTS homework_type_check;
ALTER TABLE public.homework ADD CONSTRAINT homework_type_check CHECK (type IN ('daily_word', 'rt_review'));