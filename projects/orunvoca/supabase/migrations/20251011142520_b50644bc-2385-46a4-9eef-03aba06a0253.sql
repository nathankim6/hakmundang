-- Create exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  card_set_id UUID NOT NULL REFERENCES card_sets(id) ON DELETE CASCADE,
  selected_days TEXT[] NOT NULL DEFAULT '{}',
  total_questions INTEGER NOT NULL,
  multiple_choice_count INTEGER NOT NULL,
  spelling_count INTEGER NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create exam_questions table
CREATE TABLE public.exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'spelling')),
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  choices TEXT[], -- for multiple choice questions
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create exam_submissions table
CREATE TABLE public.exam_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_session_id TEXT,
  student_name TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  score NUMERIC,
  correct_count INTEGER,
  total_count INTEGER,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create exam_results table for cumulative student reports
CREATE TABLE public.exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_session_id TEXT,
  student_name TEXT NOT NULL,
  total_exams INTEGER NOT NULL DEFAULT 0,
  total_score NUMERIC NOT NULL DEFAULT 0,
  average_score NUMERIC NOT NULL DEFAULT 0,
  exam_history JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exams
CREATE POLICY "Anyone can view exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Anyone can create exams" ON public.exams FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update exams" ON public.exams FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete exams" ON public.exams FOR DELETE USING (true);

-- RLS Policies for exam_questions
CREATE POLICY "Anyone can view exam questions" ON public.exam_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can create exam questions" ON public.exam_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update exam questions" ON public.exam_questions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete exam questions" ON public.exam_questions FOR DELETE USING (true);

-- RLS Policies for exam_submissions
CREATE POLICY "Anyone can view exam submissions" ON public.exam_submissions FOR SELECT USING (true);
CREATE POLICY "Anyone can create exam submissions" ON public.exam_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update exam submissions" ON public.exam_submissions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete exam submissions" ON public.exam_submissions FOR DELETE USING (true);

-- RLS Policies for exam_results
CREATE POLICY "Anyone can view exam results" ON public.exam_results FOR SELECT USING (true);
CREATE POLICY "Anyone can create exam results" ON public.exam_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update exam results" ON public.exam_results FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete exam results" ON public.exam_results FOR DELETE USING (true);

-- Create indexes
CREATE INDEX idx_exam_questions_exam_id ON public.exam_questions(exam_id);
CREATE INDEX idx_exam_submissions_exam_id ON public.exam_submissions(exam_id);
CREATE INDEX idx_exam_submissions_student ON public.exam_submissions(student_session_id, student_name);
CREATE INDEX idx_exam_results_student ON public.exam_results(student_session_id, student_name);