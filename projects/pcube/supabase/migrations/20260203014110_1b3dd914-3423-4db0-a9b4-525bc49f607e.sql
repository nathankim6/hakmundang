-- 일일 단어과제 제출 테이블 (학생이 직접 매일 등록)
CREATE TABLE public.daily_word_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  photo_urls TEXT[] DEFAULT '{}'::TEXT[],
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  teacher_note TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- 하루에 한 번만 제출 가능
  UNIQUE(student_id, submission_date)
);

-- RLS 활성화
ALTER TABLE public.daily_word_submissions ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Anyone can read daily word submissions"
  ON public.daily_word_submissions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert daily word submissions"
  ON public.daily_word_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update daily word submissions"
  ON public.daily_word_submissions FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete daily word submissions"
  ON public.daily_word_submissions FOR DELETE
  USING (true);