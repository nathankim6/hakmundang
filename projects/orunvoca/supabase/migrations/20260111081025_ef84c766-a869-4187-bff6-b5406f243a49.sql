-- Add is_ended column to exams table
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS is_ended boolean DEFAULT false;