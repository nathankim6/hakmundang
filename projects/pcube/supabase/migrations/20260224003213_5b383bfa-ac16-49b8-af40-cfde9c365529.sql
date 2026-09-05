-- Add assignment_type column to daily_word_submissions
ALTER TABLE public.daily_word_submissions 
ADD COLUMN assignment_type text DEFAULT '사진(단어)';

-- Create unique index for student + date + assignment_type to allow one submission per type per day
CREATE UNIQUE INDEX idx_daily_word_unique_type 
ON public.daily_word_submissions (student_id, submission_date, assignment_type);