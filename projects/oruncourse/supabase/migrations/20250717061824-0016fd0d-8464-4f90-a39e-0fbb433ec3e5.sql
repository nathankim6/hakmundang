-- 강의 테이블에 신청 시작/종료 날짜 컬럼 추가
ALTER TABLE public.courses 
ADD COLUMN application_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN application_end_date TIMESTAMP WITH TIME ZONE;

-- 기존 강의들에 기본값 설정 (현재부터 1달 후까지)
UPDATE public.courses 
SET 
  application_start_date = now(),
  application_end_date = now() + INTERVAL '1 month'
WHERE application_start_date IS NULL;