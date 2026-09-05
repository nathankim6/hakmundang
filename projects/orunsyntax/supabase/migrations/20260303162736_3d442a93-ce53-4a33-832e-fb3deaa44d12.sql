
-- Create table for permanently storing extracted vocabulary per week/grade
CREATE TABLE public.weekly_vocabulary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grade TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  vocabulary JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (grade, week_number)
);

-- Enable RLS
ALTER TABLE public.weekly_vocabulary ENABLE ROW LEVEL SECURITY;

-- Public read access (vocabulary is shared content)
CREATE POLICY "Weekly vocabulary is viewable by anyone"
ON public.weekly_vocabulary
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_weekly_vocabulary_updated_at
BEFORE UPDATE ON public.weekly_vocabulary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
