
-- Drop the old unique constraint that only checks student_id + submission_date
ALTER TABLE public.daily_word_submissions 
  DROP CONSTRAINT IF EXISTS daily_word_submissions_student_id_submission_date_key;

-- Create new unique constraint that includes assignment_type
-- This allows multiple submissions per day as long as the assignment_type is different
ALTER TABLE public.daily_word_submissions 
  ADD CONSTRAINT daily_word_submissions_student_date_type_key 
  UNIQUE (student_id, submission_date, assignment_type);
