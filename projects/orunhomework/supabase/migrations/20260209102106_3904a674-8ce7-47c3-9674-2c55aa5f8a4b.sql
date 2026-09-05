-- Enable realtime for homework table so students can see when admin deletes homework
ALTER PUBLICATION supabase_realtime ADD TABLE public.homework;