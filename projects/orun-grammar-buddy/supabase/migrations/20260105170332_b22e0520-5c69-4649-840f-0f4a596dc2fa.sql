-- Create exams table to store exam configurations
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  exam_code TEXT NOT NULL UNIQUE,
  grade TEXT NOT NULL,
  grammar_type TEXT,
  difficulty TEXT,
  question_count INTEGER NOT NULL,
  question_ids UUID[] NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (will update with auth later)
CREATE POLICY "Anyone can view exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Anyone can insert exams" ON public.exams FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update exams" ON public.exams FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete exams" ON public.exams FOR DELETE USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for exam_code lookups
CREATE INDEX idx_exams_exam_code ON public.exams(exam_code);