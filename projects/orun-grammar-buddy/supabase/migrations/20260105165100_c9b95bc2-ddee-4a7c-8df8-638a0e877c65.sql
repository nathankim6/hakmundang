-- 문제 저장을 위한 테이블 생성
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grade TEXT NOT NULL,
  grammar_type TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('상', '중', '하')),
  question_text TEXT NOT NULL,
  options JSONB,
  answer TEXT NOT NULL,
  explanation TEXT,
  source_file TEXT,
  pattern_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX idx_questions_grade ON public.questions(grade);
CREATE INDEX idx_questions_grammar_type ON public.questions(grammar_type);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);

-- RLS 비활성화 (공개 문제은행이므로)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can view questions"
ON public.questions
FOR SELECT
USING (true);

-- 모든 사용자가 추가 가능 (추후 인증 추가시 수정)
CREATE POLICY "Anyone can insert questions"
ON public.questions
FOR INSERT
WITH CHECK (true);

-- 모든 사용자가 삭제 가능
CREATE POLICY "Anyone can delete questions"
ON public.questions
FOR DELETE
USING (true);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_questions_updated_at
BEFORE UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();