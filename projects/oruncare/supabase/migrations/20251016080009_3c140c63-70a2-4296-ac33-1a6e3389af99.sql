-- Add admin access code with expiry date
INSERT INTO public.access_codes (code, name, is_admin, expiry_date)
VALUES ('101100', '관리자', true, '2099-12-31 23:59:59+00')
ON CONFLICT (code) DO NOTHING;