-- Create access codes table
CREATE TABLE public.access_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create backgrounds table
CREATE TABLE public.backgrounds (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    is_video BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backgrounds ENABLE ROW LEVEL SECURITY;

-- Create policies for access codes (admin only)
CREATE POLICY "Access codes are readable by everyone"
ON public.access_codes
FOR SELECT
USING (true);

CREATE POLICY "Access codes are writable by admins"
ON public.access_codes
FOR ALL
USING (true)
WITH CHECK (true);

-- Create policies for backgrounds (public read)
CREATE POLICY "Backgrounds are readable by everyone"
ON public.backgrounds
FOR SELECT
USING (true);

CREATE POLICY "Backgrounds are writable by admins"
ON public.backgrounds
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_access_codes_updated_at
    BEFORE UPDATE ON public.access_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.access_codes (code, name, expiry_date) VALUES
('demo123', 'Demo User', '2025-12-31 23:59:59+00');

INSERT INTO public.backgrounds (url, is_video) VALUES
('/public/assets/neural-network-bg.png', false);