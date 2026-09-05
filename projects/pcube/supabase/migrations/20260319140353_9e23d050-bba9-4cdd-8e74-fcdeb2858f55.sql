CREATE POLICY "Anyone can update dismissed daily words"
ON public.dismissed_daily_words
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);