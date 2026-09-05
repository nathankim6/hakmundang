-- Add missing columns to word_quiz_cache table
ALTER TABLE public.word_quiz_cache 
ADD COLUMN IF NOT EXISTS choices JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS correct_answers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS phonetic_transcription TEXT,
ADD COLUMN IF NOT EXISTS korean_pronunciation TEXT,
ADD COLUMN IF NOT EXISTS quiz_type TEXT DEFAULT 'meaning';

-- Create index for quiz_type if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_word_quiz_cache_quiz_type ON public.word_quiz_cache(quiz_type);

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'unique_word_meaning_type' 
                   AND table_name = 'word_quiz_cache') THEN
        ALTER TABLE public.word_quiz_cache 
        ADD CONSTRAINT unique_word_meaning_type UNIQUE (word, meaning, quiz_type);
    END IF;
END $$;