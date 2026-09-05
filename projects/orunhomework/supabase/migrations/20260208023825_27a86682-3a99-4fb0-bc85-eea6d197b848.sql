-- 앱 설정 저장 테이블 생성
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 설정 조회/수정 가능 (관리자용)
CREATE POLICY "Anyone can read app settings" 
ON public.app_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert app settings" 
ON public.app_settings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update app settings" 
ON public.app_settings 
FOR UPDATE 
USING (true);

-- 기본 발신번호 설정
INSERT INTO public.app_settings (key, value) 
VALUES ('solapi_sender_phone', '01092455554')
ON CONFLICT (key) DO NOTHING;