-- Add UPDATE policy for test_results table
CREATE POLICY "Anyone can update test results"
ON public.test_results
FOR UPDATE
USING (true)
WITH CHECK (true);