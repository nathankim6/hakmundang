CREATE UNIQUE INDEX IF NOT EXISTS idx_homework_submissions_unique 
ON public.homework_submissions (homework_id, student_id);