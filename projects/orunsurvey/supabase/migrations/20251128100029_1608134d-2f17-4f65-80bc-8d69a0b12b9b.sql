-- Make created_by nullable in surveys table
ALTER TABLE public.surveys 
ALTER COLUMN created_by DROP NOT NULL;

-- Update RLS policies to allow access code based creation
DROP POLICY IF EXISTS "Authenticated users can create surveys" ON public.surveys;
DROP POLICY IF EXISTS "Users can update their own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Users can delete their own surveys" ON public.surveys;

CREATE POLICY "Anyone can create surveys"
ON public.surveys FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update surveys"
ON public.surveys FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete surveys"
ON public.surveys FOR DELETE
USING (true);

-- Update survey questions policies
DROP POLICY IF EXISTS "Survey creators can manage questions" ON public.survey_questions;

CREATE POLICY "Anyone can manage questions"
ON public.survey_questions FOR ALL
USING (true);

-- Update survey responses policies to allow anyone to view
DROP POLICY IF EXISTS "Survey creators can view their survey responses" ON public.survey_responses;
DROP POLICY IF EXISTS "Survey creators can delete responses" ON public.survey_responses;

CREATE POLICY "Anyone can view survey responses"
ON public.survey_responses FOR SELECT
USING (true);

CREATE POLICY "Anyone can delete responses"
ON public.survey_responses FOR DELETE
USING (true);