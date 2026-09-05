
CREATE TABLE public.test_group_names (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_name TEXT NOT NULL UNIQUE,
  custom_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.test_group_names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read test group names"
ON public.test_group_names FOR SELECT USING (true);

CREATE POLICY "Anyone can insert test group names"
ON public.test_group_names FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update test group names"
ON public.test_group_names FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete test group names"
ON public.test_group_names FOR DELETE USING (true);
