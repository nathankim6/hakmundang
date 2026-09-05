
-- Create table for storing extracted exam questions
CREATE TABLE public.exam_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id INTEGER NOT NULL,
  workbook_id TEXT NOT NULL DEFAULT 'weekly-g10',
  year TEXT NOT NULL,
  month TEXT NOT NULL,
  question_number TEXT NOT NULL,
  error_rate TEXT,
  question_type TEXT NOT NULL,
  question_prompt TEXT NOT NULL,
  passage TEXT NOT NULL,
  choices TEXT[] NOT NULL DEFAULT '{}',
  answer TEXT NOT NULL,
  explanation TEXT DEFAULT '',
  translation TEXT DEFAULT '',
  vocabulary JSONB DEFAULT '[]',
  week_number INTEGER,
  position_in_week INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workbook_id, question_id)
);

-- Enable RLS
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Exam questions are viewable by anyone"
ON public.exam_questions
FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_exam_questions_updated_at
BEFORE UPDATE ON public.exam_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
