-- Make exam_code nullable in student_access_codes table
ALTER TABLE public.student_access_codes 
ALTER COLUMN exam_code DROP NOT NULL;