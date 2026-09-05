
-- Brainiac OMR schema (independent backend)

-- access_codes
CREATE TABLE public.access_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  user_name text NOT NULL DEFAULT '',
  academy text NOT NULL DEFAULT 'brainiac',
  scope text NOT NULL DEFAULT 'student',
  is_admin boolean DEFAULT false,
  expiry_date timestamptz NOT NULL,
  last_accessed timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_codes TO anon, authenticated;
GRANT ALL ON public.access_codes TO service_role;
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "access_codes all" ON public.access_codes FOR ALL USING (true) WITH CHECK (true);

-- tests
CREATE TABLE public.tests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  question_count integer NOT NULL,
  answers jsonb NOT NULL,
  writing_questions jsonb,
  is_ended boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tests TO anon, authenticated;
GRANT ALL ON public.tests TO service_role;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tests all" ON public.tests FOR ALL USING (true) WITH CHECK (true);

-- test_results
CREATE TABLE public.test_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id text NOT NULL REFERENCES public.tests(test_id) ON DELETE CASCADE,
  student_name text,
  student_answers jsonb NOT NULL,
  score numeric NOT NULL,
  correct_count integer NOT NULL,
  total_count integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_test_results_test_id ON public.test_results(test_id);
CREATE INDEX idx_test_results_student_name ON public.test_results(student_name);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.test_results TO anon, authenticated;
GRANT ALL ON public.test_results TO service_role;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "test_results all" ON public.test_results FOR ALL USING (true) WITH CHECK (true);

-- level_test_results
CREATE TABLE public.level_test_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name text NOT NULL,
  student_school text,
  student_grade text,
  academy text NOT NULL DEFAULT 'brainiac',
  level text NOT NULL DEFAULT '',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_score numeric NOT NULL DEFAULT 0,
  section_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  sub_category_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  grade_overrides jsonb,
  special_class_assignments jsonb,
  elapsed_time integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_level_test_results_academy ON public.level_test_results(academy);
CREATE INDEX idx_level_test_results_student ON public.level_test_results(student_name);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.level_test_results TO anon, authenticated;
GRANT ALL ON public.level_test_results TO service_role;
ALTER TABLE public.level_test_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "level_test_results all" ON public.level_test_results FOR ALL USING (true) WITH CHECK (true);

-- test_group_names
CREATE TABLE public.test_group_names (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_name text NOT NULL,
  custom_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.test_group_names TO anon, authenticated;
GRANT ALL ON public.test_group_names TO service_role;
ALTER TABLE public.test_group_names ENABLE ROW LEVEL SECURITY;
CREATE POLICY "test_group_names all" ON public.test_group_names FOR ALL USING (true) WITH CHECK (true);

-- deletion_log
CREATE TABLE public.deletion_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name text NOT NULL,
  record_id text NOT NULL,
  associated_records integer DEFAULT 0,
  deleted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deletion_log TO anon, authenticated;
GRANT ALL ON public.deletion_log TO service_role;
ALTER TABLE public.deletion_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deletion_log all" ON public.deletion_log FOR ALL USING (true) WITH CHECK (true);

-- vocabulary_distractors
CREATE TABLE public.vocabulary_distractors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id integer NOT NULL,
  word text NOT NULL,
  correct_answer text NOT NULL,
  distractors text[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_vocab_distractors_qid ON public.vocabulary_distractors(question_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vocabulary_distractors TO anon, authenticated;
GRANT ALL ON public.vocabulary_distractors TO service_role;
ALTER TABLE public.vocabulary_distractors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vocabulary_distractors all" ON public.vocabulary_distractors FOR ALL USING (true) WITH CHECK (true);

-- student_test_history
CREATE TABLE public.student_test_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name text NOT NULL,
  student_class text,
  test_count integer DEFAULT 0,
  total_score numeric DEFAULT 0,
  average_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_test_history TO anon, authenticated;
GRANT ALL ON public.student_test_history TO service_role;
ALTER TABLE public.student_test_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student_test_history all" ON public.student_test_history FOR ALL USING (true) WITH CHECK (true);

-- classes (used by admin)
CREATE TABLE public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  teacher text NOT NULL DEFAULT '',
  schedule text NOT NULL DEFAULT '',
  progress text NOT NULL DEFAULT '',
  wordbook text NOT NULL DEFAULT '',
  description text,
  start_date date,
  end_date date,
  teacher_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO anon, authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "classes all" ON public.classes FOR ALL USING (true) WITH CHECK (true);

-- user_roles
CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE POLICY "user_roles self select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_test_group_names_updated BEFORE UPDATE ON public.test_group_names
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_vocab_distractors_updated BEFORE UPDATE ON public.vocabulary_distractors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_student_history_updated BEFORE UPDATE ON public.student_test_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed admin + student access codes
INSERT INTO public.access_codes (code, name, user_name, academy, scope, is_admin, expiry_date)
VALUES
  ('brain00', '브레니악 관리자', '관리자', 'brainiac', 'admin', true, (now() + interval '50 years')),
  ('brainiac', '브레니악 학생', '학생', 'brainiac', 'student', false, (now() + interval '50 years'));
