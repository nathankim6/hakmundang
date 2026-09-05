
CREATE TABLE public.student_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.report_cards(id) ON DELETE CASCADE,
  school text NOT NULL,
  grade text NOT NULL,
  student_name text NOT NULL,
  score numeric,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_submissions TO authenticated;
GRANT ALL ON public.student_submissions TO service_role;

ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access" ON public.student_submissions FOR SELECT USING (true);
CREATE POLICY "Allow insert" ON public.student_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update" ON public.student_submissions FOR UPDATE USING (true);
CREATE POLICY "Allow delete" ON public.student_submissions FOR DELETE USING (true);

CREATE INDEX idx_student_submissions_report_id ON public.student_submissions(report_id);

CREATE TRIGGER trg_student_submissions_updated_at
BEFORE UPDATE ON public.student_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
