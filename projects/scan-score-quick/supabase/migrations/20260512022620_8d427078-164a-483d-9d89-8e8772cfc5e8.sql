
-- access_codes: remove public catch-all and public read; keep deny-select.
DROP POLICY IF EXISTS "Enable complete access for all" ON public.access_codes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.access_codes;

-- orun_access_codes: remove public read; tighten write policies to admin-only via JWT claim.
DROP POLICY IF EXISTS "Anyone can read orun access codes" ON public.orun_access_codes;
DROP POLICY IF EXISTS "Admins can insert orun access codes" ON public.orun_access_codes;
DROP POLICY IF EXISTS "Admins can update orun access codes" ON public.orun_access_codes;
DROP POLICY IF EXISTS "Admins can delete orun access codes" ON public.orun_access_codes;

-- Re-create admin-scoped write policies that actually check admin status via JWT claim
CREATE POLICY "Admins via JWT claim can insert orun access codes"
ON public.orun_access_codes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.access_codes ac
    WHERE ac.code = ((current_setting('request.jwt.claims', true))::json ->> 'access_code')
      AND ac.is_admin = true
  )
);

CREATE POLICY "Admins via JWT claim can update orun access codes"
ON public.orun_access_codes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.access_codes ac
    WHERE ac.code = ((current_setting('request.jwt.claims', true))::json ->> 'access_code')
      AND ac.is_admin = true
  )
);

CREATE POLICY "Admins via JWT claim can delete orun access codes"
ON public.orun_access_codes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.access_codes ac
    WHERE ac.code = ((current_setting('request.jwt.claims', true))::json ->> 'access_code')
      AND ac.is_admin = true
  )
);

-- external_access_codes: remove the catch-all permissive policy
DROP POLICY IF EXISTS "Enable complete access for external access codes" ON public.external_access_codes;
