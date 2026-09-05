-- Create dedicated access codes table for this project
CREATE TABLE IF NOT EXISTS public.orun_access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  last_accessed TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.orun_access_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read orun access codes"
ON public.orun_access_codes
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert orun access codes"
ON public.orun_access_codes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update orun access codes"
ON public.orun_access_codes
FOR UPDATE
USING (true);

CREATE POLICY "Admins can delete orun access codes"
ON public.orun_access_codes
FOR DELETE
USING (true);

-- Insert admin access code
INSERT INTO public.orun_access_codes (code, name, is_admin, expiry_date)
VALUES ('101100', '관리자', true, '2099-12-31 23:59:59+00')
ON CONFLICT (code) DO NOTHING;