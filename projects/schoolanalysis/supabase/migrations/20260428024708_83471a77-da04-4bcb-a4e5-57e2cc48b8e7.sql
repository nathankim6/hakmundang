DROP POLICY IF EXISTS "Allow all access to prediction_feedback" ON public.prediction_feedback;

CREATE POLICY "Anyone can view prediction feedback"
ON public.prediction_feedback
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create valid prediction feedback"
ON public.prediction_feedback
FOR INSERT
WITH CHECK (
  report_id IS NOT NULL
  AND school_name <> ''
  AND year >= 1900
  AND predicted_std_dev >= 0
  AND actual_std_dev >= 0
);

CREATE POLICY "Anyone can update valid prediction feedback"
ON public.prediction_feedback
FOR UPDATE
USING (
  report_id IS NOT NULL
  AND school_name <> ''
  AND year >= 1900
  AND predicted_std_dev >= 0
  AND actual_std_dev >= 0
)
WITH CHECK (
  report_id IS NOT NULL
  AND school_name <> ''
  AND year >= 1900
  AND predicted_std_dev >= 0
  AND actual_std_dev >= 0
);

CREATE POLICY "Anyone can delete valid prediction feedback"
ON public.prediction_feedback
FOR DELETE
USING (
  report_id IS NOT NULL
  AND school_name <> ''
  AND year >= 1900
  AND predicted_std_dev >= 0
  AND actual_std_dev >= 0
);