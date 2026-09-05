-- Create storage bucket for past exam files
INSERT INTO storage.buckets (id, name, public)
VALUES ('past_exams', 'past_exams', true);

-- Create table for past exam files
CREATE TABLE public.past_exam_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school TEXT NOT NULL,
  exam_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.past_exam_files ENABLE ROW LEVEL SECURITY;

-- Create policies for past_exam_files table
CREATE POLICY "Anyone can view past exam files"
ON public.past_exam_files
FOR SELECT
USING (true);

CREATE POLICY "Anyone can upload past exam files"
ON public.past_exam_files
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete past exam files"
ON public.past_exam_files
FOR DELETE
USING (true);

-- Create policies for storage bucket
CREATE POLICY "Past exam files are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'past_exams');

CREATE POLICY "Anyone can upload past exam files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'past_exams');

CREATE POLICY "Anyone can delete past exam files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'past_exams');