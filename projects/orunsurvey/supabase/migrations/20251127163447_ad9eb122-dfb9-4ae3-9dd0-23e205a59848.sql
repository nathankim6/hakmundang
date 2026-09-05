-- Add delete policy for survey responses
CREATE POLICY "Allow anyone to delete survey responses"
ON public.survey_responses
FOR DELETE
USING (true);