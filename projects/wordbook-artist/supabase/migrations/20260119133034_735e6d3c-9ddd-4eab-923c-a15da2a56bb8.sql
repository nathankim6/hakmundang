-- Add English definition and etymology columns to words table
ALTER TABLE public.words 
ADD COLUMN IF NOT EXISTS english_definition TEXT,
ADD COLUMN IF NOT EXISTS etymology TEXT;