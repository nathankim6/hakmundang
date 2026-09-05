-- Create table for storing prediction feedback and learning data
CREATE TABLE IF NOT EXISTS public.prediction_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  predicted_std_dev DECIMAL NOT NULL,
  actual_std_dev DECIMAL NOT NULL,
  error_rate DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prediction_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since this app doesn't use auth)
CREATE POLICY "Allow all access to prediction_feedback" 
ON public.prediction_feedback 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX idx_prediction_feedback_report_id ON public.prediction_feedback(report_id);
CREATE INDEX idx_prediction_feedback_year ON public.prediction_feedback(year);