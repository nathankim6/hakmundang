-- Add grade column to questions table
ALTER TABLE public.questions 
ADD COLUMN grade text NOT NULL DEFAULT '1학년';