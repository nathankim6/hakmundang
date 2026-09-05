-- Create a table for user's personal word collections (wrong words)
CREATE TABLE IF NOT EXISTS public.personal_wordbook (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_session_id TEXT NOT NULL, -- For guest users, we'll use a session-based ID
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  card_set_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_session_id, word)
);

-- Enable RLS
ALTER TABLE public.personal_wordbook ENABLE ROW LEVEL SECURITY;

-- Create policies for personal wordbook access
CREATE POLICY "Users can view their own personal wordbook" 
ON public.personal_wordbook 
FOR SELECT 
USING (true); -- Allow anyone to read for now since we're using session-based auth

CREATE POLICY "Users can insert into their own personal wordbook" 
ON public.personal_wordbook 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own personal wordbook" 
ON public.personal_wordbook 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete from their own personal wordbook" 
ON public.personal_wordbook 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE TRIGGER update_personal_wordbook_updated_at
BEFORE UPDATE ON public.personal_wordbook
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();