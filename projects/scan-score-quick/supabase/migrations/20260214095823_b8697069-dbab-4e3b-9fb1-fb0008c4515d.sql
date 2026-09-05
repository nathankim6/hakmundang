-- Drop existing permissive SELECT policy on access_codes
DROP POLICY IF EXISTS "Allow public read access to access_codes" ON public.access_codes;
DROP POLICY IF EXISTS "Allow select access to access_codes" ON public.access_codes;
DROP POLICY IF EXISTS "allow_select_access_codes" ON public.access_codes;

-- Create restrictive SELECT policy - deny all direct client reads
-- The verify-access-code edge function uses service_role key and bypasses RLS
CREATE POLICY "Deny direct select on access_codes"
  ON public.access_codes
  FOR SELECT
  USING (false);

-- Also lock down orun_access_codes (similar sensitive table)
DROP POLICY IF EXISTS "Allow public read access to orun_access_codes" ON public.orun_access_codes;
DROP POLICY IF EXISTS "Allow select access to orun_access_codes" ON public.orun_access_codes;
DROP POLICY IF EXISTS "allow_select_orun_access_codes" ON public.orun_access_codes;

CREATE POLICY "Deny direct select on orun_access_codes"
  ON public.orun_access_codes
  FOR SELECT
  USING (false);

-- Also lock down external_access_codes
DROP POLICY IF EXISTS "Allow public read access to external_access_codes" ON public.external_access_codes;
DROP POLICY IF EXISTS "Allow select access to external_access_codes" ON public.external_access_codes;
DROP POLICY IF EXISTS "allow_select_external_access_codes" ON public.external_access_codes;

CREATE POLICY "Deny direct select on external_access_codes"
  ON public.external_access_codes
  FOR SELECT
  USING (false);