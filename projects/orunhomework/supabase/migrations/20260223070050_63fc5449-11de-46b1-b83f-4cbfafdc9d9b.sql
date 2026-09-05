-- Enable realtime for homework_submissions table so RT submission labels update in real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.homework_submissions;