-- Add question_type column to questions table for 객관식/주관식 classification
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS question_type text DEFAULT '객관식';

-- Add comment for documentation
COMMENT ON COLUMN public.questions.question_type IS '문제 유형: 객관식 또는 주관식';