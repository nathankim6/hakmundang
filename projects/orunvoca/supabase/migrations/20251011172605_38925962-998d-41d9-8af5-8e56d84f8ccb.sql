-- Add columns for GPT-generated content in exam questions
ALTER TABLE exam_questions 
ADD COLUMN IF NOT EXISTS example_sentence text,
ADD COLUMN IF NOT EXISTS english_definition text;

COMMENT ON COLUMN exam_questions.example_sentence IS 'GPT-generated example sentence for example-type questions';
COMMENT ON COLUMN exam_questions.english_definition IS 'GPT-generated English definition for definition-type questions';