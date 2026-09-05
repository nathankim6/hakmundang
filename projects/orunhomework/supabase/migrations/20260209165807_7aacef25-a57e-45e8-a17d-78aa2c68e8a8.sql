
-- Add owner_code_id to app_settings for per-teacher settings
ALTER TABLE public.app_settings ADD COLUMN owner_code_id uuid REFERENCES public.access_codes(id) ON DELETE CASCADE;

-- Drop old unique constraint on key (if exists) and create composite unique
ALTER TABLE public.app_settings DROP CONSTRAINT IF EXISTS app_settings_key_key;
ALTER TABLE public.app_settings ADD CONSTRAINT app_settings_key_owner_unique UNIQUE (key, owner_code_id);

-- Create index for efficient filtering
CREATE INDEX idx_app_settings_owner ON public.app_settings(owner_code_id);
