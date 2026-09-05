-- 개인 단어장 테이블 생성
CREATE TABLE public.my_wordbook (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  review_count INTEGER DEFAULT 0,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.my_wordbook ENABLE ROW LEVEL SECURITY;

-- 학생들이 자신의 단어장만 볼 수 있도록 하는 정책
CREATE POLICY "Students can view their own wordbook" 
ON public.my_wordbook 
FOR SELECT 
USING (true);

-- 학생들이 자신의 단어장에 단어를 추가할 수 있는 정책
CREATE POLICY "Students can insert words into their wordbook" 
ON public.my_wordbook 
FOR INSERT 
WITH CHECK (true);

-- 학생들이 자신의 단어장 단어를 수정할 수 있는 정책
CREATE POLICY "Students can update their own wordbook" 
ON public.my_wordbook 
FOR UPDATE 
USING (true);

-- 학생들이 자신의 단어장 단어를 삭제할 수 있는 정책
CREATE POLICY "Students can delete their own wordbook" 
ON public.my_wordbook 
FOR DELETE 
USING (true);

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER update_my_wordbook_updated_at
BEFORE UPDATE ON public.my_wordbook
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 중복 단어 방지를 위한 인덱스
CREATE UNIQUE INDEX idx_my_wordbook_student_word 
ON public.my_wordbook (student_name, word);