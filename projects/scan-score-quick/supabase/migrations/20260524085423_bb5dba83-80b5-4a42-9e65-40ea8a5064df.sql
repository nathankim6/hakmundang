INSERT INTO public.access_codes (code, name, user_name, is_admin, expiry_date)
VALUES ('101100', '관리자', 'Admin', true, '2099-12-31 23:59:59+00')
ON CONFLICT (code) DO UPDATE SET is_admin = true, expiry_date = '2099-12-31 23:59:59+00';