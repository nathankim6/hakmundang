-- Create card_sets table to store flashcard sets
CREATE TABLE public.card_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT,
  test_type TEXT NOT NULL DEFAULT 'meaning', -- 'meaning' or 'spelling'
  word_data JSONB NOT NULL DEFAULT '[]'::jsonb, -- stores the word data from excel
  selected_days TEXT[] NOT NULL DEFAULT '{}' -- stores selected days for the test
);

-- Enable Row Level Security
ALTER TABLE public.card_sets ENABLE ROW LEVEL SECURITY;

-- Create policies for card_sets
CREATE POLICY "Anyone can view card sets" 
ON public.card_sets 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create card sets" 
ON public.card_sets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update card sets" 
ON public.card_sets 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete card sets" 
ON public.card_sets 
FOR DELETE 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_card_sets_updated_at
BEFORE UPDATE ON public.card_sets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();