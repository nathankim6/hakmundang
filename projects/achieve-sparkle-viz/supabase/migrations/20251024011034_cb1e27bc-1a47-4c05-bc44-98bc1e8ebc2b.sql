-- 리포트 저장 테이블 생성
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  schools JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 인덱스 추가
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);

-- RLS 활성화 (누구나 읽고 쓸 수 있도록 설정)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 모두가 조회할 수 있는 정책
CREATE POLICY "Everyone can view reports" 
ON public.reports 
FOR SELECT 
USING (true);

-- 모두가 생성할 수 있는 정책
CREATE POLICY "Everyone can create reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (true);

-- 모두가 수정할 수 있는 정책
CREATE POLICY "Everyone can update reports" 
ON public.reports 
FOR UPDATE 
USING (true);

-- 모두가 삭제할 수 있는 정책
CREATE POLICY "Everyone can delete reports" 
ON public.reports 
FOR DELETE 
USING (true);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- updated_at 트리거
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();