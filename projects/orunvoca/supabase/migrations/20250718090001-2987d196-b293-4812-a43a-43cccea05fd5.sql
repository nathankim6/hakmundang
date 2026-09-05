-- Create table to cache word quiz data
CREATE TABLE public.word_quiz_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  english_definition TEXT NOT NULL,
  part_of_speech TEXT NOT NULL,
  wrong_choices TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.word_quiz_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is cached data that can be shared)
CREATE POLICY "Allow anyone to read word quiz cache" 
ON public.word_quiz_cache 
FOR SELECT 
USING (true);

CREATE POLICY "Allow anyone to insert word quiz cache" 
ON public.word_quiz_cache 
FOR INSERT 
WITH CHECK (true);

-- Create unique index to prevent duplicates and improve query performance
CREATE UNIQUE INDEX idx_word_quiz_cache_word_meaning ON public.word_quiz_cache (word, meaning);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_word_quiz_cache_updated_at
BEFORE UPDATE ON public.word_quiz_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();