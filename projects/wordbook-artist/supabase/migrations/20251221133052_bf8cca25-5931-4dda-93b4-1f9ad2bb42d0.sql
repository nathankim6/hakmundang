-- Create workbooks table to store generated vocabulary workbooks
CREATE TABLE public.workbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'ORUN ENGLISH',
  theme_color TEXT NOT NULL DEFAULT '#1A1A1A',
  secondary_color TEXT NOT NULL DEFAULT '#D4AF37',
  difficulty_level TEXT NOT NULL DEFAULT 'middle',
  include_examples BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create day_groups table to store day groupings
CREATE TABLE public.day_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workbook_id UUID NOT NULL REFERENCES public.workbooks(id) ON DELETE CASCADE,
  day_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create words table to store vocabulary words
CREATE TABLE public.words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_group_id UUID NOT NULL REFERENCES public.day_groups(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  pronunciation TEXT,
  part_of_speech TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create examples table to store word examples
CREATE TABLE public.word_examples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word_id UUID NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
  english TEXT NOT NULL,
  korean TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (public access for now - no auth required)
ALTER TABLE public.workbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_examples ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view workbooks" ON public.workbooks FOR SELECT USING (true);
CREATE POLICY "Anyone can create workbooks" ON public.workbooks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update workbooks" ON public.workbooks FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete workbooks" ON public.workbooks FOR DELETE USING (true);

CREATE POLICY "Anyone can view day_groups" ON public.day_groups FOR SELECT USING (true);
CREATE POLICY "Anyone can create day_groups" ON public.day_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete day_groups" ON public.day_groups FOR DELETE USING (true);

CREATE POLICY "Anyone can view words" ON public.words FOR SELECT USING (true);
CREATE POLICY "Anyone can create words" ON public.words FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete words" ON public.words FOR DELETE USING (true);

CREATE POLICY "Anyone can view word_examples" ON public.word_examples FOR SELECT USING (true);
CREATE POLICY "Anyone can create word_examples" ON public.word_examples FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete word_examples" ON public.word_examples FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_day_groups_workbook_id ON public.day_groups(workbook_id);
CREATE INDEX idx_words_day_group_id ON public.words(day_group_id);
CREATE INDEX idx_word_examples_word_id ON public.word_examples(word_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_workbooks_updated_at
BEFORE UPDATE ON public.workbooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();