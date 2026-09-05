-- Create passages table
CREATE TABLE public.passages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    item_id TEXT NOT NULL,
    interpretation TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.passages ENABLE ROW LEVEL SECURITY;

-- Create policies for passages (public read/write for now)
CREATE POLICY "Passages are accessible by everyone"
ON public.passages
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_passages_updated_at
    BEFORE UPDATE ON public.passages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();