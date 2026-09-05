-- Create card_assignments table for individual and class-based assignments
CREATE TABLE public.card_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_set_id TEXT NOT NULL,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('individual', 'class')),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  assigned_by TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  score NUMERIC,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure either student_id or class_id is set based on assignment_type
  CONSTRAINT check_assignment_target CHECK (
    (assignment_type = 'individual' AND student_id IS NOT NULL AND class_id IS NULL) OR
    (assignment_type = 'class' AND class_id IS NOT NULL AND student_id IS NULL)
  )
);

-- Enable RLS
ALTER TABLE public.card_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on card_assignments" 
ON public.card_assignments 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_card_assignments_updated_at
BEFORE UPDATE ON public.card_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_card_assignments_student_id ON public.card_assignments(student_id);
CREATE INDEX idx_card_assignments_class_id ON public.card_assignments(class_id);
CREATE INDEX idx_card_assignments_card_set_id ON public.card_assignments(card_set_id);
CREATE INDEX idx_card_assignments_type ON public.card_assignments(assignment_type);