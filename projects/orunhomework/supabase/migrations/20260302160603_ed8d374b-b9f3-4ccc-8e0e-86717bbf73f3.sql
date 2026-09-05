-- First, remove duplicate rows keeping only the latest one per (key, owner_code_id)
DELETE FROM app_settings a
USING app_settings b
WHERE a.id < b.id
  AND a.key = b.key
  AND a.owner_code_id IS NOT DISTINCT FROM b.owner_code_id;

-- Add unique index that handles NULL owner_code_id
CREATE UNIQUE INDEX IF NOT EXISTS app_settings_key_owner_unique 
ON app_settings (key, COALESCE(owner_code_id, '00000000-0000-0000-0000-000000000000'));