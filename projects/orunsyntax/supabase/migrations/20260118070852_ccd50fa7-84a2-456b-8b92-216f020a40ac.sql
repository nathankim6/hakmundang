-- Create table for access codes
CREATE TABLE public.access_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  use_count INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read access codes (for login validation)
CREATE POLICY "Access codes are readable by anyone" 
ON public.access_codes 
FOR SELECT 
USING (true);

-- Only allow authenticated admins to manage codes (we'll use service role for this)
-- For now, allow insert/update/delete from edge functions only

-- Create table for syntax analyses
CREATE TABLE public.syntax_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id INTEGER NOT NULL UNIQUE,
  analysis TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.syntax_analyses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read syntax analyses
CREATE POLICY "Syntax analyses are readable by anyone" 
ON public.syntax_analyses 
FOR SELECT 
USING (true);

-- Create indexes for faster lookups
CREATE INDEX idx_access_codes_code ON public.access_codes(code);
CREATE INDEX idx_syntax_analyses_question_id ON public.syntax_analyses(question_id);

-- Insert default access codes
INSERT INTO public.access_codes (code) VALUES 
  ('123456'),
  ('654321'),
  ('111111');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for syntax_analyses timestamp updates
CREATE TRIGGER update_syntax_analyses_updated_at
BEFORE UPDATE ON public.syntax_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();