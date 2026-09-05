-- Add writing_questions column to tests table for writing test questions
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS writing_questions JSONB DEFAULT NULL;