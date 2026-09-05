-- Add name column to student_access_codes table
ALTER TABLE public.student_access_codes 
ADD COLUMN name text NOT NULL DEFAULT '사용자';