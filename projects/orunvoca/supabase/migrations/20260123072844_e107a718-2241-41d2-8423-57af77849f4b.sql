-- Update exam_questions table to allow new question type 'synonym_antonym'
ALTER TABLE exam_questions 
DROP CONSTRAINT IF EXISTS exam_questions_question_type_check;

ALTER TABLE exam_questions
ADD CONSTRAINT exam_questions_question_type_check 
CHECK (question_type IN ('multiple_choice', 'spelling', 'example', 'definition', 'synonym_antonym'));

-- Add synonym_antonym_count column to exams table
ALTER TABLE exams
ADD COLUMN IF NOT EXISTS synonym_antonym_count INTEGER DEFAULT 0;