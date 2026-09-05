-- Create question_grammar_categories table
CREATE TABLE public.question_grammar_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workbook_id TEXT NOT NULL DEFAULT 'syntax10000',
  question_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workbook_id, question_id)
);

-- Create index for faster queries
CREATE INDEX idx_question_grammar_categories_workbook_id ON public.question_grammar_categories(workbook_id);
CREATE INDEX idx_question_grammar_categories_question_id ON public.question_grammar_categories(question_id);
CREATE INDEX idx_question_grammar_categories_category ON public.question_grammar_categories(category);

-- Enable RLS
ALTER TABLE public.question_grammar_categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view
CREATE POLICY "Question grammar categories are viewable by anyone"
ON public.question_grammar_categories
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_question_grammar_categories_updated_at
BEFORE UPDATE ON public.question_grammar_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();