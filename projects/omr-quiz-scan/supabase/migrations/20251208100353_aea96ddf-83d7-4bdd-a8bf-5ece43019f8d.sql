-- Add DELETE policy for level_test_results table
CREATE POLICY "Anyone can delete level test results"
ON public.level_test_results
FOR DELETE
USING (true);