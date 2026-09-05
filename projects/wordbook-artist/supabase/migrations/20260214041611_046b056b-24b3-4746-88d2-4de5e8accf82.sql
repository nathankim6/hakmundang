
-- Table to store organized vocabulary projects
CREATE TABLE public.organized_vocab_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'ORUN VOCA Ultimate',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_words INTEGER NOT NULL DEFAULT 0,
  total_days INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.organized_vocab_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view organized_vocab_projects" ON public.organized_vocab_projects FOR SELECT USING (true);
CREATE POLICY "Anyone can create organized_vocab_projects" ON public.organized_vocab_projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update organized_vocab_projects" ON public.organized_vocab_projects FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete organized_vocab_projects" ON public.organized_vocab_projects FOR DELETE USING (true);

-- Table to store organized words within a project
CREATE TABLE public.organized_vocab_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.organized_vocab_projects(id) ON DELETE CASCADE,
  day_name TEXT NOT NULL,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.organized_vocab_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view organized_vocab_words" ON public.organized_vocab_words FOR SELECT USING (true);
CREATE POLICY "Anyone can create organized_vocab_words" ON public.organized_vocab_words FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update organized_vocab_words" ON public.organized_vocab_words FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete organized_vocab_words" ON public.organized_vocab_words FOR DELETE USING (true);

-- Index for fast lookups
CREATE INDEX idx_organized_vocab_words_project ON public.organized_vocab_words(project_id);
CREATE INDEX idx_organized_vocab_words_day ON public.organized_vocab_words(project_id, day_name);

-- Trigger for updated_at
CREATE TRIGGER update_organized_vocab_projects_updated_at
BEFORE UPDATE ON public.organized_vocab_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
