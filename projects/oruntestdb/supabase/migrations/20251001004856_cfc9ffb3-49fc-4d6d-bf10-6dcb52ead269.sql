-- Rename subject column to question_type
ALTER TABLE public.questions RENAME COLUMN subject TO question_type;

-- Add difficulty column
ALTER TABLE public.questions ADD COLUMN difficulty text NOT NULL DEFAULT '중';

-- Rename exam_date to exam_year and change type to text
ALTER TABLE public.questions RENAME COLUMN exam_date TO exam_year;
ALTER TABLE public.questions ALTER COLUMN exam_year TYPE text;