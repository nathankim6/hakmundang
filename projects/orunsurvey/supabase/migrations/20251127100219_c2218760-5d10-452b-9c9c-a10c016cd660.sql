-- Create survey_responses table to store survey data
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school TEXT NOT NULL,
  name TEXT NOT NULL,
  join_class TEXT NOT NULL,
  join_class_other TEXT,
  exam_type TEXT NOT NULL,
  time_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  additional_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert survey responses
CREATE POLICY "Anyone can submit survey responses" 
ON public.survey_responses 
FOR INSERT 
WITH CHECK (true);

-- Allow authenticated users to view all responses (for admin page)
CREATE POLICY "Authenticated users can view all responses" 
ON public.survey_responses 
FOR SELECT 
USING (true);