-- Create table for TA comments by teachers
CREATE TABLE public.ta_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ta_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for TA comments
CREATE POLICY "Allow all operations on ta_comments"
  ON public.ta_comments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_ta_comments_updated_at
  BEFORE UPDATE ON public.ta_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();