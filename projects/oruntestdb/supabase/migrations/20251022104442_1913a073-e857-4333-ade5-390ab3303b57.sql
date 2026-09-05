-- Create schools table for managing school options and logos
CREATE TABLE IF NOT EXISTS public.schools (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  logo_path text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Create policies for schools table
CREATE POLICY "Anyone can view schools"
ON public.schools
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert schools"
ON public.schools
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update schools"
ON public.schools
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete schools"
ON public.schools
FOR DELETE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_schools_updated_at
BEFORE UPDATE ON public.schools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing schools from the app
INSERT INTO public.schools (name, logo_path) VALUES
  ('수도전자기계고등학교', '/src/assets/school-logos/sudo.png'),
  ('성의과학고등학교', '/src/assets/school-logos/sungui.png'),
  ('서울동일과학기술고등학교', '/src/assets/school-logos/danggok.png'),
  ('과람고등학교', '/src/assets/school-logos/guam.png'),
  ('성남산업고등학교', '/src/assets/school-logos/seongnam.png'),
  ('영등포공업고등학교', '/src/assets/school-logos/youngdeungpo.png')
ON CONFLICT (name) DO NOTHING;