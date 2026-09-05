-- Add definition_count and example_count columns to exams table
ALTER TABLE exams 
ADD COLUMN IF NOT EXISTS definition_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS example_count integer NOT NULL DEFAULT 0;