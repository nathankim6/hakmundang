-- 어휘 문제 오답 선지 저장 테이블
CREATE TABLE public.vocabulary_distractors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id INTEGER NOT NULL UNIQUE,
  word TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  distractors TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vocabulary_distractors ENABLE ROW LEVEL SECURITY;

-- 누구나 읽을 수 있도록 정책 설정 (공개 데이터)
CREATE POLICY "Anyone can view distractors" 
ON public.vocabulary_distractors 
FOR SELECT 
USING (true);

-- 누구나 삽입 가능 (선지 생성 시)
CREATE POLICY "Anyone can insert distractors" 
ON public.vocabulary_distractors 
FOR INSERT 
WITH CHECK (true);

-- 인덱스 추가
CREATE INDEX idx_vocabulary_distractors_question_id ON public.vocabulary_distractors(question_id);