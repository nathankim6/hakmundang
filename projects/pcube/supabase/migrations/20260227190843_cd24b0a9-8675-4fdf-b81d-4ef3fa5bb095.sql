-- Enable realtime for assignment tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_word_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.homework_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.homework;