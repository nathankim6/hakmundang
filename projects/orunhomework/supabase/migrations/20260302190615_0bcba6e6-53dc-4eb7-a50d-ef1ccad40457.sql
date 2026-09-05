
CREATE TABLE public.mock_exam_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  exam_year INTEGER NOT NULL,
  exam_month INTEGER NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  owner_code_id UUID REFERENCES public.access_codes(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (student_id, exam_year, exam_month)
);

ALTER TABLE public.mock_exam_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read mock_exam_scores" ON public.mock_exam_scores FOR SELECT USING (true);
CREATE POLICY "Anyone can insert mock_exam_scores" ON public.mock_exam_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update mock_exam_scores" ON public.mock_exam_scores FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete mock_exam_scores" ON public.mock_exam_scores FOR DELETE USING (true);
