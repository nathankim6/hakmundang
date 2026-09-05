-- Add UPDATE policy for vocabulary_distractors table
CREATE POLICY "Anyone can update distractors" 
ON public.vocabulary_distractors 
FOR UPDATE 
USING (true)
WITH CHECK (true);