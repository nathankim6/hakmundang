-- 옳은 커밋(Commit) 테이블 생성 - 과제 기한 연장 요청
CREATE TABLE public.deadline_extensions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  homework_id UUID REFERENCES public.homework(id) ON DELETE CASCADE,
  daily_word_date DATE, -- 일일 단어과제인 경우 해당 날짜
  original_due_date DATE NOT NULL,
  new_due_date DATE NOT NULL,
  commitment_message TEXT NOT NULL, -- 다짐 코멘트
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by TEXT, -- 승인한 관리자 이름
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.deadline_extensions ENABLE ROW LEVEL SECURITY;

-- 누구나 읽을 수 있음
CREATE POLICY "Anyone can read deadline extensions"
ON public.deadline_extensions
FOR SELECT
USING (true);

-- 누구나 생성 가능
CREATE POLICY "Anyone can insert deadline extensions"
ON public.deadline_extensions
FOR INSERT
WITH CHECK (true);

-- 누구나 업데이트 가능 (관리자가 승인/거부)
CREATE POLICY "Anyone can update deadline extensions"
ON public.deadline_extensions
FOR UPDATE
USING (true);

-- 누구나 삭제 가능
CREATE POLICY "Anyone can delete deadline extensions"
ON public.deadline_extensions
FOR DELETE
USING (true);

-- 인덱스 추가
CREATE INDEX idx_deadline_extensions_student ON public.deadline_extensions(student_id);
CREATE INDEX idx_deadline_extensions_status ON public.deadline_extensions(status);