-- Enable realtime for events table
ALTER TABLE public.events REPLICA IDENTITY FULL;

-- Add events table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;