-- Create schools table
CREATE TABLE public.schools (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_name text NOT NULL UNIQUE,
  logo_path text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Insert existing schools
INSERT INTO public.schools (school_name, logo_path) VALUES
  ('강남중학교', 'gangnam-middle.webp'),
  ('숭의여자중학교', 'sungui-middle.webp'),
  ('구암중학교', 'guam-middle.webp'),
  ('신길중학교', 'singil.webp'),
  ('당곡중학교', 'danggok-middle.png'),
  ('장승중학교', 'jangseung.png'),
  ('동양중학교', 'dongyang.png'),
  ('상현중학교', 'sanghyeon.webp'),
  ('영등포중학교', 'youngdeungpo-middle.webp'),
  ('국사봉중학교', 'guksabong.jpg'),
  ('중앙대사범대학부속중학교', 'cau.jpg');