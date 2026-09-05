CREATE POLICY "Anyone can update level test results"
ON public.level_test_results
FOR UPDATE
USING (true)
WITH CHECK (true);