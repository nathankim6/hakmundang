-- Allow DELETE operations on test_results table
DROP POLICY IF EXISTS "Anyone can delete test results" ON public.test_results;

CREATE POLICY "Anyone can delete test results"
ON public.test_results
FOR DELETE
USING (true);