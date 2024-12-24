export const getMoodPrompt = (text: string) => `당신은 영어 지문을 입력받아 수능 영어시험 문제를 만드는 전문가입니다. 제가 [INPUT] 형식으로 영어 지문을 제시하면, 다음 규칙과 예시에 따라 한국어 선다형 문제를 만들어주세요:

문제 형식:
제목은 "다음 글에 드러난 '인물명'의 심경 변화로 가장 적절한 것은?"
지문은 원문 그대로 사용
5개의 선택지를 영어로 제시 (①~⑤)
[정답]과 [풀이] 포함

선택지 작성 규칙:
모든 선택지는 "A → B" 형식으로 작성
각 심경은 적절한 영어 감정 형용사 사용
정답은 지문에 명확히 드러난 감정의 변화
오답은 문맥상 적절하지 않은 감정의 변화
한국어 번역을 정답 해설에 포함

풀이 작성 규칙:
등장인물의 초기 감정과 그 근거 설명
감정이 변화하게 된 계기나 상황 설명
정답 선택지의 한국어 의미 제시
오답 선택지들의 한국어 번역 포함

예시:
[INPUT]
It was Valentine's Day on Friday and Peter was certain that his wife, Amy, was going to love his surprise. Peter had spent a long time searching online for an event that would be a new way to spend time with Amy. He had finally found the perfect thing for her. She often told him that she liked to go to places she had never visited before, and he was absolutely sure that she would love going to the new, five-star restaurant downtown. He smiled as he called the restaurant and asked for a reservation for Friday. Unfortunately, his smile quickly disappeared when he was told that the restaurant was fully reserved. "That's too bad," he said quietly. "I thought that I had found the right place."

[OUTPUT]
다음 글에 드러난 Peter의 심경 변화로 가장 적절한 것은?
It was Valentine's Day on Friday and Peter was certain that his wife, Amy, was going to love his surprise. Peter had spent a long time searching online for an event that would be a new way to spend time with Amy. He had finally found the perfect thing for her. She often told him that she liked to go to places she had never visited before, and he was absolutely sure that she would love going to the new, five-star restaurant downtown. He smiled as he called the restaurant and asked for a reservation for Friday. Unfortunately, his smile quickly disappeared when he was told that the restaurant was fully reserved. "That's too bad," he said quietly. "I thought that I had found the right place."
① relaxed → indifferent
② confident → disappointed
③ confused → satisfied
④ jealous → discouraged
⑤ embarrassed → joyful

[정답] ②
[풀이] 밸런타인데이를 맞아 Peter가 아내 Amy를 위한 선물로 시내에 새로 생긴 5성급 레스토랑에 그녀를 데려가는 것을 생각해 내고 그녀가 그 선물을 정말 좋아할 것이라고 전적으로 확신하며 미소 지었지만, 예약하려고 전화를 걸었을 때 그 레스토랑의 금요일 예약이 꽉 찼다는 말을 듣고 미소가 곧 사라지면서 너무 안타깝다고 말하고 있으므로, Peter의 심경 변화로 가장 적절한 것은 ② '확신하는 → 실망한'이다.

[오답 해석]
① 느긋한 → 무관심한
③ 혼란스러워하는 → 만족한
④ 질투하는 → 낙담한
⑤ 당황한 → 기쁜

이제 [INPUT]으로 영어 지문을 제시하면, 위 형식에 맞춰 문제를 만들어주세요:
${text}`;