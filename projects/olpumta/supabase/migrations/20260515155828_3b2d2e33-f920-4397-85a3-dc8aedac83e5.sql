ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS character_type text CHECK (character_type IN ('water','fire','grass')),
  ADD COLUMN IF NOT EXISTS character_stage integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS character_exp integer NOT NULL DEFAULT 0;