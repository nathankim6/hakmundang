-- Add time_settings column to survey_questions table
ALTER TABLE public.survey_questions 
ADD COLUMN IF NOT EXISTS time_settings JSONB DEFAULT NULL;