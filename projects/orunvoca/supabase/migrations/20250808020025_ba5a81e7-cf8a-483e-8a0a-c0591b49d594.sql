-- Create pronunciation_cache table to store pronunciation information
CREATE TABLE IF NOT EXISTS public.pronunciation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  ipa TEXT,
  korean TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pronunciation_cache ENABLE ROW LEVEL SECURITY;

-- Create policies to allow everyone to read and insert pronunciation data
CREATE POLICY "Anyone can view pronunciation data" 
ON public.pronunciation_cache 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert pronunciation data" 
ON public.pronunciation_cache 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update pronunciation data" 
ON public.pronunciation_cache 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_pronunciation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pronunciation_cache_updated_at
  BEFORE UPDATE ON public.pronunciation_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pronunciation_updated_at();

-- Insert some default pronunciation data for common words
INSERT INTO public.pronunciation_cache (word, ipa, korean) VALUES
  ('board', '/bɔːrd/', '보드'),
  ('bill', '/bɪl/', '빌'),
  ('raise', '/reɪz/', '레이즈'),
  ('break', '/breɪk/', '브레이크'),
  ('plain', '/pleɪn/', '플레인'),
  ('flat', '/flæt/', '플랫'),
  ('court', '/kɔːrt/', '코트'),
  ('steep', '/stiːp/', '스티프'),
  ('move', '/muːv/', '무브'),
  ('trunk', '/trʌŋk/', '트렁크'),
  ('draw', '/drɔː/', '드로')
ON CONFLICT (word) DO NOTHING;