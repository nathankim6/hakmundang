-- Add analysis_type column to report_cards table
ALTER TABLE public.report_cards 
ADD COLUMN analysis_type TEXT DEFAULT 'detailed' CHECK (analysis_type IN ('detailed', 'simple'));