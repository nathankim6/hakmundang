-- Add synonyms and antonyms columns to words table
ALTER TABLE public.words 
ADD COLUMN synonyms text[] DEFAULT '{}',
ADD COLUMN antonyms text[] DEFAULT '{}',
ADD COLUMN synonyms_korean text[] DEFAULT '{}',
ADD COLUMN antonyms_korean text[] DEFAULT '{}';