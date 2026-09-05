-- 문제 테이블 생성
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school TEXT NOT NULL,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  answer TEXT NOT NULL,
  explanation TEXT,
  exam_date DATE NOT NULL,
  semester TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화 (나중에 인증 추가 가능)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 문제를 볼 수 있도록 설정 (공개 문제은행)
CREATE POLICY "Anyone can view questions"
  ON public.questions
  FOR SELECT
  USING (true);

-- 모든 사용자가 문제를 등록/수정/삭제할 수 있도록 설정 (관리자 기능은 나중에 추가 가능)
CREATE POLICY "Anyone can insert questions"
  ON public.questions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update questions"
  ON public.questions
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete questions"
  ON public.questions
  FOR DELETE
  USING (true);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 설정
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 샘플 데이터 삽입
INSERT INTO public.questions (school, subject, title, content, answer, explanation, exam_date, semester, exam_type) VALUES
('강남고등학교', '국어', '고전 문학 작품의 주제 분석', '다음 작품을 읽고, 작품의 주제를 서술하시오.\n\n[작품 내용 생략]\n\n이 작품에 나타난 주제 의식을 현대적 관점에서 해석하고, 그 의미를 논하시오. (200자 내외)', '이 작품의 주제는 신분 제도의 모순과 인간 존엄성에 대한 탐구이다. 주인공은 신분 제약을 극복하려는 의지를 보이며, 이는 현대 사회의 평등과 인권 개념과 맥을 같이한다.', '작품의 시대적 배경을 고려하여 주제를 분석해야 합니다. 신분제 사회의 모순을 비판적으로 바라보는 작가의 시각이 중요합니다.', '2024-10-15', '2학기 중간', '중간고사'),
('대원외국어고등학교', '영어', '영문 에세이 작성 - 환경 문제', 'Write an essay about environmental issues in your community. Include specific examples and propose practical solutions. (200-250 words)', 'Sample Answer: In my community, we face several environmental challenges, particularly air pollution and waste management. The increasing number of vehicles has led to poor air quality, affecting residents'' health. To address this, we should promote public transportation and create more bicycle lanes. Additionally, implementing a comprehensive recycling program would significantly reduce waste in landfills.', 'Essay should include: 1) Clear introduction stating the main environmental issue, 2) Specific examples from the community, 3) Practical and realistic solutions, 4) Conclusion summarizing the importance of action', '2024-09-20', '2학기 중간', '중간고사'),
('서울고등학교', '수학', '미적분 응용 문제', '다음 조건을 만족하는 함수 f(x)에 대하여 물음에 답하시오.\n\n(1) f''(x)를 구하시오.\n(2) f(x)의 극값을 구하고, 그 이유를 설명하시오.\n(3) 주어진 구간에서 f(x)의 최댓값과 최솟값을 구하는 과정을 서술하시오.', '(1) f''(x) = 3x² - 6x + 2\n(2) f''(x) = 0일 때, x = 1 ± √(1/3)\n극댓값: f(1-√(1/3)), 극솟값: f(1+√(1/3))\n(3) 주어진 구간의 양 끝점과 극값의 함숫값을 비교하여 최댓값과 최솟값 결정', '미분을 이용한 극값 구하기: 1) 1차 도함수를 0으로 만드는 x값 찾기, 2) 2차 도함수로 극대/극소 판정, 3) 구간의 끝점 값과 비교', '2024-10-12', '2학기 중간', '중간고사'),
('용산고등학교', '과학', '화학 반응식과 양적 관계', '다음 화학 반응에 대하여 물음에 답하시오.\n\n[반응식 생략]\n\n(1) 균형 맞춘 화학 반응식을 쓰고, 그 이유를 설명하시오.\n(2) 주어진 조건에서 생성되는 생성물의 질량을 구하는 과정을 단계별로 서술하시오.', '(1) 2H₂ + O₂ → 2H₂O\n질량 보존 법칙에 따라 반응 전후 원자의 종류와 개수가 같아야 함\n(2) 1) 반응물의 몰수 계산, 2) 한계 반응물 결정, 3) 생성물의 몰수 계산, 4) 질량으로 환산', '화학 반응의 양적 관계: 몰 개념을 이용하여 반응물과 생성물의 양을 계산합니다. 한계 반응물을 정확히 파악하는 것이 중요합니다.', '2024-10-08', '2학기 중간', '중간고사'),
('강남고등학교', '사회', '민주주의 발전 과정 분석', '한국 민주주의의 발전 과정을 시대별로 구분하고, 각 시기의 특징과 의의를 서술하시오. 또한 현대 한국 사회에서 민주주의가 직면한 과제를 제시하고 해결 방안을 논하시오. (400자 내외)', '1) 1948년 정부수립: 자유민주주의 체제 수립\n2) 1960년 4.19혁명: 부정선거에 대한 저항, 민주주의 열망\n3) 1987년 6월 민주항쟁: 직선제 쟁취, 절차적 민주주의 확립\n4) 현대 과제: 경제적 불평등, 정치적 양극화 → 사회적 대화 강화, 시민 참여 확대 필요', '각 시기의 역사적 사건과 그 의의를 명확히 연결하여 서술해야 합니다. 현대 과제는 구체적이고 현실적인 해결 방안과 함께 제시해야 합니다.', '2024-10-05', '2학기 중간', '중간고사');