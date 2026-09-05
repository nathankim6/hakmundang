-- Add teacher comment field to test_schedules table
ALTER TABLE public.test_schedules 
ADD COLUMN teacher_comment text;