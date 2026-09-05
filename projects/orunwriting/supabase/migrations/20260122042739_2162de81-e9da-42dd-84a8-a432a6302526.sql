-- Create exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  creator TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exam_problems table
CREATE TABLE public.exam_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  problem_number INTEGER NOT NULL,
  korean TEXT NOT NULL,
  english TEXT NOT NULL,
  shuffled_words TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exam_submissions table
CREATE TABLE public.exam_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  affiliation TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  total_problems INTEGER NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create submission_answers table for per-problem analysis
CREATE TABLE public.submission_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.exam_submissions(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.exam_problems(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_answers ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required for exam participation)
CREATE POLICY "Anyone can view exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Anyone can create exams" ON public.exams FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete exams" ON public.exams FOR DELETE USING (true);

CREATE POLICY "Anyone can view exam problems" ON public.exam_problems FOR SELECT USING (true);
CREATE POLICY "Anyone can create exam problems" ON public.exam_problems FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete exam problems" ON public.exam_problems FOR DELETE USING (true);

CREATE POLICY "Anyone can view submissions" ON public.exam_submissions FOR SELECT USING (true);
CREATE POLICY "Anyone can create submissions" ON public.exam_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view submission answers" ON public.submission_answers FOR SELECT USING (true);
CREATE POLICY "Anyone can create submission answers" ON public.submission_answers FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_exam_problems_exam_id ON public.exam_problems(exam_id);
CREATE INDEX idx_exam_submissions_exam_id ON public.exam_submissions(exam_id);
CREATE INDEX idx_submission_answers_submission_id ON public.submission_answers(submission_id);
CREATE INDEX idx_submission_answers_problem_id ON public.submission_answers(problem_id);