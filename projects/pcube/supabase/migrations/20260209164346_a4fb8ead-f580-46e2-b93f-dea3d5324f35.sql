
-- Add owner_code_id to schools table (which teacher owns this school)
ALTER TABLE public.schools ADD COLUMN owner_code_id uuid REFERENCES public.access_codes(id) ON DELETE SET NULL;

-- Add owner_code_id to passages table
ALTER TABLE public.passages ADD COLUMN owner_code_id uuid REFERENCES public.access_codes(id) ON DELETE SET NULL;

-- Add owner_code_id to homework table  
ALTER TABLE public.homework ADD COLUMN owner_code_id uuid REFERENCES public.access_codes(id) ON DELETE SET NULL;

-- Create index for efficient filtering
CREATE INDEX idx_schools_owner ON public.schools(owner_code_id);
CREATE INDEX idx_passages_owner ON public.passages(owner_code_id);
CREATE INDEX idx_homework_owner ON public.homework(owner_code_id);
