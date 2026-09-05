-- Add columns to store AI-generated analysis results
ALTER TABLE public.reports 
ADD COLUMN ai_analysis TEXT,
ADD COLUMN subject_analysis TEXT;