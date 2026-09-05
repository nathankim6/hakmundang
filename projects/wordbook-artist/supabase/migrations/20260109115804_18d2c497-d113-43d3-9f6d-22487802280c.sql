-- Add cover_subtitle column to workbooks table
ALTER TABLE public.workbooks 
ADD COLUMN cover_subtitle TEXT DEFAULT '';