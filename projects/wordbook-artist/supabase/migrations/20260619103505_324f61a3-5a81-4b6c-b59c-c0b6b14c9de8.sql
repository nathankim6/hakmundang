CREATE TABLE public.sungnam_meaning_examples (
  word TEXT PRIMARY KEY,
  examples JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sungnam_meaning_examples TO authenticated;
GRANT SELECT ON public.sungnam_meaning_examples TO anon;
GRANT ALL ON public.sungnam_meaning_examples TO service_role;

ALTER TABLE public.sungnam_meaning_examples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read meaning examples"
  ON public.sungnam_meaning_examples FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert meaning examples"
  ON public.sungnam_meaning_examples FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update meaning examples"
  ON public.sungnam_meaning_examples FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_sungnam_meaning_examples_updated_at
  BEFORE UPDATE ON public.sungnam_meaning_examples
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();