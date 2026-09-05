-- Create surveys table
CREATE TABLE public.surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create survey_questions table
CREATE TABLE public.survey_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'text', 'radio', 'checkbox', 'time_range', 'textarea'
  options JSONB DEFAULT '[]'::jsonb,
  is_required BOOLEAN NOT NULL DEFAULT true,
  question_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add survey_id to existing survey_responses table
ALTER TABLE public.survey_responses 
ADD COLUMN survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

-- Surveys policies
CREATE POLICY "Anyone can view active surveys"
ON public.surveys FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can create surveys"
ON public.surveys FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own surveys"
ON public.surveys FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own surveys"
ON public.surveys FOR DELETE
USING (auth.uid() = created_by);

-- Survey questions policies
CREATE POLICY "Anyone can view questions for active surveys"
ON public.survey_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.surveys
    WHERE surveys.id = survey_questions.survey_id
    AND surveys.is_active = true
  )
);

CREATE POLICY "Survey creators can manage questions"
ON public.survey_questions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.surveys
    WHERE surveys.id = survey_questions.survey_id
    AND surveys.created_by = auth.uid()
  )
);

-- Update survey_responses policies to work with survey_id
DROP POLICY IF EXISTS "Anyone can submit survey responses" ON public.survey_responses;
DROP POLICY IF EXISTS "Authenticated users can view all responses" ON public.survey_responses;
DROP POLICY IF EXISTS "Allow anyone to delete survey responses" ON public.survey_responses;

CREATE POLICY "Anyone can submit responses to active surveys"
ON public.survey_responses FOR INSERT
WITH CHECK (
  survey_id IS NULL OR -- Keep backward compatibility with old responses
  EXISTS (
    SELECT 1 FROM public.surveys
    WHERE surveys.id = survey_responses.survey_id
    AND surveys.is_active = true
  )
);

CREATE POLICY "Survey creators can view their survey responses"
ON public.survey_responses FOR SELECT
USING (
  survey_id IS NULL OR -- Allow viewing legacy responses
  EXISTS (
    SELECT 1 FROM public.surveys
    WHERE surveys.id = survey_responses.survey_id
    AND surveys.created_by = auth.uid()
  )
);

CREATE POLICY "Survey creators can delete responses"
ON public.survey_responses FOR DELETE
USING (
  survey_id IS NULL OR
  EXISTS (
    SELECT 1 FROM public.surveys
    WHERE surveys.id = survey_responses.survey_id
    AND surveys.created_by = auth.uid()
  )
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.surveys
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_surveys_slug ON public.surveys(slug);
CREATE INDEX idx_surveys_created_by ON public.surveys(created_by);
CREATE INDEX idx_survey_questions_survey_id ON public.survey_questions(survey_id);
CREATE INDEX idx_survey_responses_survey_id ON public.survey_responses(survey_id);