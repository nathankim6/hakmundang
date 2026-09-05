-- 접속 코드 테이블 생성
CREATE TABLE public.access_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- RLS 활성화
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 코드 확인 가능 (로그인용)
CREATE POLICY "Anyone can check access codes"
  ON public.access_codes
  FOR SELECT
  USING (true);

-- 관리자만 코드 관리 가능 (앱 레벨에서 체크)
CREATE POLICY "Anyone can insert access codes"
  ON public.access_codes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update access codes"
  ON public.access_codes
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete access codes"
  ON public.access_codes
  FOR DELETE
  USING (true);

-- 기본 관리자 코드 추가
INSERT INTO public.access_codes (code, name, is_admin, is_active)
VALUES ('101100', '관리자', true, true);