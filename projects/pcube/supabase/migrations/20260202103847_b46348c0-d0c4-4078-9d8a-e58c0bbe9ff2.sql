-- 지문 테이블에 학교/학년 연결 추가
ALTER TABLE public.passages 
ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
ADD COLUMN grade_id UUID REFERENCES public.grades(id) ON DELETE CASCADE;

-- 인덱스 추가
CREATE INDEX idx_passages_school ON public.passages(school_id);
CREATE INDEX idx_passages_grade ON public.passages(grade_id);