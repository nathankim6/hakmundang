-- 액세스 코드별 단어장 접근 권한 테이블 생성
CREATE TABLE public.access_code_card_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  access_code_id UUID NOT NULL REFERENCES public.student_access_codes(id) ON DELETE CASCADE,
  card_set_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(access_code_id, card_set_id)
);

-- RLS 활성화
ALTER TABLE public.access_code_card_sets ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 정책 생성
CREATE POLICY "Anyone can read access_code_card_sets"
ON public.access_code_card_sets
FOR SELECT
USING (true);

-- 인증된 사용자가 모든 작업을 할 수 있도록 정책 생성 (관리자용)
CREATE POLICY "Anyone can insert access_code_card_sets"
ON public.access_code_card_sets
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update access_code_card_sets"
ON public.access_code_card_sets
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete access_code_card_sets"
ON public.access_code_card_sets
FOR DELETE
USING (true);

-- 인덱스 생성
CREATE INDEX idx_access_code_card_sets_access_code_id ON public.access_code_card_sets(access_code_id);
CREATE INDEX idx_access_code_card_sets_card_set_id ON public.access_code_card_sets(card_set_id);