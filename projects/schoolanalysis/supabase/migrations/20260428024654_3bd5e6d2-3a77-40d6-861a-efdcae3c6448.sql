ALTER TABLE public.reports
ADD CONSTRAINT reports_region_allowed
CHECK (region IN ('dongjak', 'songpa'));

DROP POLICY IF EXISTS "Anyone can create reports" ON public.reports;
DROP POLICY IF EXISTS "Anyone can update reports" ON public.reports;
DROP POLICY IF EXISTS "Anyone can delete reports" ON public.reports;

CREATE POLICY "Anyone can create valid regional reports"
ON public.reports
FOR INSERT
WITH CHECK (region IN ('dongjak', 'songpa'));

CREATE POLICY "Anyone can update valid regional reports"
ON public.reports
FOR UPDATE
USING (region IN ('dongjak', 'songpa'))
WITH CHECK (region IN ('dongjak', 'songpa'));

CREATE POLICY "Anyone can delete regional reports"
ON public.reports
FOR DELETE
USING (region IN ('dongjak', 'songpa'));