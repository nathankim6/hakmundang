CREATE TABLE public.day_reading_passages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workbook_id uuid NOT NULL,
  day_name text NOT NULL,
  passage_en text NOT NULL,
  passage_ko text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  word_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workbook_id, day_name)
);

GRANT SELECT ON public.day_reading_passages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.day_reading_passages TO authenticated;
GRANT ALL ON public.day_reading_passages TO service_role;

ALTER TABLE public.day_reading_passages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view day_reading_passages" ON public.day_reading_passages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create day_reading_passages" ON public.day_reading_passages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update day_reading_passages" ON public.day_reading_passages FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete day_reading_passages" ON public.day_reading_passages FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_day_reading_passages_updated_at BEFORE UPDATE ON public.day_reading_passages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();