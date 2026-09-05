
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS recipient_phone text,
  ADD COLUMN IF NOT EXISTS recipient_type text DEFAULT 'student';
