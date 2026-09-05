-- 단어 시험 캐시 테이블 생성
CREATE TABLE public.word_quiz_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  choices JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  phonetic_transcription TEXT,
  korean_pronunciation TEXT,
  quiz_type TEXT NOT NULL DEFAULT 'meaning',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 인덱스 생성 (빠른 검색을 위해)
CREATE INDEX idx_word_quiz_cache_word_meaning ON public.word_quiz_cache(word, meaning);
CREATE INDEX idx_word_quiz_cache_quiz_type ON public.word_quiz_cache(quiz_type);

-- 중복 방지를 위한 유니크 제약조건
ALTER TABLE public.word_quiz_cache 
ADD CONSTRAINT unique_word_meaning_type UNIQUE (word, meaning, quiz_type);

-- RLS 활성화
ALTER TABLE public.word_quiz_cache ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능 (캐시 데이터이므로)
CREATE POLICY "Anyone can view word quiz cache" 
ON public.word_quiz_cache 
FOR SELECT 
USING (true);

-- 모든 사용자가 삽입 가능 (캐시 데이터 생성)
CREATE POLICY "Anyone can insert word quiz cache" 
ON public.word_quiz_cache 
FOR INSERT 
WITH CHECK (true);

-- 모든 사용자가 업데이트 가능 (캐시 데이터 갱신)
CREATE POLICY "Anyone can update word quiz cache" 
ON public.word_quiz_cache 
FOR UPDATE 
USING (true);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_word_quiz_cache_updated_at
BEFORE UPDATE ON public.word_quiz_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();