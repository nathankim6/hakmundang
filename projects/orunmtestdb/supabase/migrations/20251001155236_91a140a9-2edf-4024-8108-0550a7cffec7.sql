-- Add grade column to past_exam_files table
ALTER TABLE public.past_exam_files
ADD COLUMN grade TEXT NOT NULL DEFAULT '1학년';