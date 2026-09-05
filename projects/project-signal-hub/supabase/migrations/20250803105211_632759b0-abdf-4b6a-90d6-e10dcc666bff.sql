-- Create table for header customization settings
CREATE TABLE public.header_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_url text NOT NULL DEFAULT '/lovable-uploads/8c4bc904-f076-4eb5-baad-6de31705ad79.png',
  title text NOT NULL DEFAULT 'ORUN TASK MANAGER',
  subtitle text NOT NULL DEFAULT 'Intelligent Work Management',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.header_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read header settings" 
ON public.header_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert header settings" 
ON public.header_settings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update header settings" 
ON public.header_settings 
FOR UPDATE 
USING (true);

-- Insert default settings
INSERT INTO public.header_settings (logo_url, title, subtitle) 
VALUES (
  '/lovable-uploads/8c4bc904-f076-4eb5-baad-6de31705ad79.png',
  'ORUN TASK MANAGER',
  'Intelligent Work Management'
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_header_settings_updated_at
BEFORE UPDATE ON public.header_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();