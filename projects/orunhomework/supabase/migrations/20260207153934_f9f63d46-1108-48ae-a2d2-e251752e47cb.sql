-- 학생이 무시/삭제한 일일 단어과제 날짜를 저장하는 테이블
CREATE TABLE public.dismissed_daily_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  dismissed_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, dismissed_date)
);

-- RLS 활성화
ALTER TABLE public.dismissed_daily_words ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Anyone can read dismissed daily words"
ON public.dismissed_daily_words FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert dismissed daily words"
ON public.dismissed_daily_words FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete dismissed daily words"
ON public.dismissed_daily_words FOR DELETE
USING (true);