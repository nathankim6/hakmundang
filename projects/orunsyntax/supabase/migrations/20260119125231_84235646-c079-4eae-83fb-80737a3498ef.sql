-- Add workbook_id column to syntax_analyses table
ALTER TABLE public.syntax_analyses 
ADD COLUMN workbook_id text NOT NULL DEFAULT 'syntax10000';

-- Drop the existing unique constraint on question_id
ALTER TABLE public.syntax_analyses 
DROP CONSTRAINT IF EXISTS syntax_analyses_question_id_key;

-- Create a new composite unique constraint on question_id + workbook_id
ALTER TABLE public.syntax_analyses 
ADD CONSTRAINT syntax_analyses_question_workbook_unique UNIQUE (question_id, workbook_id);

-- Update existing records to have proper workbook_id based on question_id ranges
-- Records with question_id 1-2320 that were likely from syntax2320 need to be identified
-- For now, keep them as syntax10000 (the default) since we can't distinguish them
-- New records will be properly tagged going forward