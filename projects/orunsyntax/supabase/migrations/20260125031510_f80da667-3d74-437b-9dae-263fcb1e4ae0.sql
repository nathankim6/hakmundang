-- Add allowed_workbooks column to access_codes table
-- This column stores an array of workbook IDs that the access code can access
-- Workbook IDs: 'syntax10000-vol1', 'syntax10000-vol2', 'syntax10000-vol3', 'syntax2320'
-- NULL or empty array means no access to any workbook
-- Admin code (101100) is handled separately in code and has access to all workbooks

ALTER TABLE public.access_codes 
ADD COLUMN IF NOT EXISTS allowed_workbooks text[] DEFAULT ARRAY[]::text[];

-- Add a comment explaining the column
COMMENT ON COLUMN public.access_codes.allowed_workbooks IS 'Array of workbook IDs this code can access. Valid values: syntax10000-vol1, syntax10000-vol2, syntax10000-vol3, syntax2320';