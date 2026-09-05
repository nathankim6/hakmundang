-- Add unique constraint on key column for upsert to work
ALTER TABLE public.app_settings ADD CONSTRAINT app_settings_key_unique UNIQUE (key);