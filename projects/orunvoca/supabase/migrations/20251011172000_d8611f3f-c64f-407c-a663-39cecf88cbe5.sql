-- Update exam_questions table to allow new question types
ALTER TABLE exam_questions 
DROP CONSTRAINT IF EXISTS exam_questions_question_type_check;

ALTER TABLE exam_questions
ADD CONSTRAINT exam_questions_question_type_check 
CHECK (question_type IN ('multiple_choice', 'spelling', 'example', 'definition'));