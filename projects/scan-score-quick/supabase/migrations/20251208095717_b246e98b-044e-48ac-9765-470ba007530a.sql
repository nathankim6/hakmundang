-- Create level_test_results table to store level test results
CREATE TABLE public.level_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_school TEXT,
  student_grade TEXT,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_score NUMERIC NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'Beginner',
  section_scores JSONB NOT NULL DEFAULT '[]'::jsonb,
  sub_category_scores JSONB NOT NULL DEFAULT '[]'::jsonb,
  elapsed_time INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.level_test_results ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can insert and view)
CREATE POLICY "Anyone can insert level test results" 
ON public.level_test_results 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view level test results" 
ON public.level_test_results 
FOR SELECT 
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_level_test_results_created_at ON public.level_test_results(created_at DESC);
CREATE INDEX idx_level_test_results_student_name ON public.level_test_results(student_name);