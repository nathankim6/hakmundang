-- Enable realtime for schools table
ALTER TABLE public.schools REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.schools;