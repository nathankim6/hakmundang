
CREATE TABLE public.report_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school TEXT NOT NULL,
  grade TEXT NOT NULL,
  exam_scope TEXT NOT NULL,
  teacher TEXT NOT NULL DEFAULT '미정',
  teacher_photo TEXT,
  total_questions INTEGER NOT NULL DEFAULT 0,
  objective_questions INTEGER NOT NULL DEFAULT 0,
  subjective_questions INTEGER NOT NULL DEFAULT 0,
  problem_types TEXT,
  overall_evaluation TEXT,
  difficult_problems_explanation TEXT,
  exam_info TEXT,
  hit_question_photos TEXT[],
  highlights TEXT,
  analysis_type TEXT DEFAULT 'detailed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (but allow public access since this app has no auth)
ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;

-- Allow all operations publicly (no auth in this app)
CREATE POLICY "Allow public read" ON public.report_cards FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.report_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.report_cards FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.report_cards FOR DELETE USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_report_cards_updated_at
  BEFORE UPDATE ON public.report_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
