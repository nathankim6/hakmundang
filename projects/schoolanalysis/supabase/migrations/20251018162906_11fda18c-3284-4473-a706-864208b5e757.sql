-- Create reports table to store school reports
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_name TEXT NOT NULL,
  school_logo TEXT,
  year_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can view, create, update, delete)
CREATE POLICY "Anyone can view reports" 
ON public.reports 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update reports" 
ON public.reports 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete reports" 
ON public.reports 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();