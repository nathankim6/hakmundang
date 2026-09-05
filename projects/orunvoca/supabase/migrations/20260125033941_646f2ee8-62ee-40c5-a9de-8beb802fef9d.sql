-- 액세스 코드별 시험 접근 권한 테이블 생성
CREATE TABLE public.access_code_exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  access_code_id UUID NOT NULL REFERENCES public.student_access_codes(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(access_code_id, exam_id)
);

-- RLS 활성화
ALTER TABLE public.access_code_exams ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 정책 생성
CREATE POLICY "Anyone can read access_code_exams"
ON public.access_code_exams
FOR SELECT
USING (true);

-- 인증된 사용자가 모든 작업을 할 수 있도록 정책 생성 (관리자용)
CREATE POLICY "Anyone can insert access_code_exams"
ON public.access_code_exams
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update access_code_exams"
ON public.access_code_exams
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete access_code_exams"
ON public.access_code_exams
FOR DELETE
USING (true);

-- 인덱스 생성
CREATE INDEX idx_access_code_exams_access_code_id ON public.access_code_exams(access_code_id);
CREATE INDEX idx_access_code_exams_exam_id ON public.access_code_exams(exam_id);