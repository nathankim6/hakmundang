
-- Homework assignments table (teacher creates)
CREATE TABLE public.homeworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  access_code_id uuid NOT NULL,
  class_name text,
  grade text,
  card_set_id uuid NOT NULL REFERENCES public.card_sets(id) ON DELETE CASCADE,
  selected_days text[] NOT NULL DEFAULT '{}',
  due_date timestamp with time zone NOT NULL,
  homework_types text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_by text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homeworks ENABLE ROW LEVEL SECURITY;

-- RLS policies for homeworks
CREATE POLICY "Anyone can view homeworks" ON public.homeworks FOR SELECT USING (true);
CREATE POLICY "Anyone can create homeworks" ON public.homeworks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update homeworks" ON public.homeworks FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete homeworks" ON public.homeworks FOR DELETE USING (true);

-- Homework submissions table (student submits)
CREATE TABLE public.homework_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id uuid NOT NULL REFERENCES public.homeworks(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_phone_last4 text NOT NULL,
  student_class text,
  answers jsonb NOT NULL DEFAULT '[]',
  score numeric,
  correct_count integer,
  total_count integer,
  is_completed boolean NOT NULL DEFAULT false,
  retry_count integer NOT NULL DEFAULT 0,
  wrong_words jsonb DEFAULT '[]',
  time_spent_seconds integer DEFAULT 0,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for homework_submissions
CREATE POLICY "Anyone can view homework submissions" ON public.homework_submissions FOR SELECT USING (true);
CREATE POLICY "Anyone can create homework submissions" ON public.homework_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update homework submissions" ON public.homework_submissions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete homework submissions" ON public.homework_submissions FOR DELETE USING (true);
