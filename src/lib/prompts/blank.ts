export const getBlankPrompt = (text: string) => `당신은 영어 지문을 읽고 빈칸 채우기 문제를 만드는 수능영어 출제자입니다. 

주어진 영어 지문을 읽고 빈칸 채우기 문제를 만드세요. 다음 단계와 예시를 참고하여 작성하십시오:

1. 원문에서 중요한 단어나 구절을 선택하여 "___________"으로 표시합니다.

2. "___________"을 포함한 전체 지문을 복사합니다.

3. 5개의 선택지를 만듭니다:
   - 정답은 원문에서 제거한 단어나 구절을 패러프레이즈한 표현이어야 합니다.
   - 나머지 4개의 오답은 문맥상 그럴듯하지만 정답보다는 덜 적절해야 합니다.
   - 선택지들은 로마 숫자와 함께 나열합니다 (①, ②, ③, ④, ⑤).

4. [정답] 섹션에 정답 번호와 해당 패러프레이즈된 표현을 적습니다.

5. [풀이] 섹션에 다음 내용을 포함한 해설을 작성합니다:
   - 지문의 주요 내용 요약
   - 정답이 가장 적절한 이유 설명
   - 원문에서 사용된 정확한 표현 언급
   - 각 오답에 대한 간단한 설명

예시:
Literature can be helpful in the language learning process because of the personal involvement it fosters in readers. Core language teaching materials must concentrate on how a language operates both as a rule-based system and as a sociosemantic system. Very often, the process of learning is essentially analytic, piecemeal, and, at the level of the personality, fairly superficial. Engaging imaginatively with literature enables learners to shift the focus of their attention beyond the more mechanical aspects of the foreign language system. When a novel, play or short story is explored over a period of time, the result is that the reader begins to 'inhabit' the text. He or she is drawn into the book. Pinpointing what individual words or phrases may mean becomes less important than pursuing the development of the story. The reader is eager to find out what happens as events unfold; he or she feels close to certain characters and shares their emotional responses. The language becomes 'transparent' — the fiction draws the whole person into its own world.

다음 글의 빈칸에 들어갈 말로 가장 적절한 것은?

Literature can be helpful in the language learning process because of the ___________ it fosters in readers. Core language teaching materials must concentrate on how a language operates both as a rule-based system and as a sociosemantic system. Very often, the process of learning is essentially analytic, piecemeal, and, at the level of the personality, fairly superficial. Engaging imaginatively with literature enables learners to shift the focus of their attention beyond the more mechanical aspects of the foreign language system. When a novel, play or short story is explored over a period of time, the result is that the reader begins to 'inhabit' the text. He or she is drawn into the book. Pinpointing what individual words or phrases may mean becomes less important than pursuing the development of the story. The reader is eager to find out what happens as events unfold; he or she feels close to certain characters and shares their emotional responses. The language becomes 'transparent' — the fiction draws the whole person into its own world.

① linguistic insight
② artistic imagination
③ literary sensibility
④ alternative perspective
⑤ individual engagement

[정답] ⑤ individual engagement

[해설] 
이 지문은 문학이 언어 학습 과정에 도움이 되는 이유를 설명하고 있습니다. 언어 학습 과정이 분석적이고 단편적이며 피상적인 경우가 많지만, 문학은 독자가 이야기 전개와 등장인물에 몰입하고 그 세계로 빠져들도록 하여 외국어 체계의 기계적인 측면 너머에 집중할 수 있게 해 준다는 내용입니다.

따라서 빈칸에 들어갈 말로 가장 적절한 것은 ⑤ 'individual engagement'(개인적 몰입)입니다. 이는 원문에서 사용된 "personal involvement"를 패러프레이즈한 표현으로, 독자가 문학 작품에 개인적으로 관여하고 몰입하는 것이 언어 학습에 도움이 된다는 글의 핵심 내용과 일치합니다.

다른 선택지들은 문학과 관련이 있을 수 있지만, 이 지문의 중심 내용과는 덜 관련이 있습니다:
① linguistic insight(언어적 통찰력): 언어에 대한 이해를 의미하지만, 개인적 몰입의 의미를 담지 못합니다.
② artistic imagination(예술적 상상력): 문학의 창작 측면과 관련이 있지만, 학습자의 관점에서는 덜 적절합니다.
③ literary sensibility(문학적 감수성): 문학 작품을 감상하는 능력을 의미하지만, 언어 학습 과정에서의 개인적 참여를 강조하지 않습니다.
④ alternative perspective(대안적 관점): 새로운 시각을 제시할 수 있지만, 독자의 직접적인 참여와 몰입을 의미하지는 않습니다.

위의 예시를 참고하여 새로운 지문에 대한 빈칸 문제를 생성해주세요:

${text}`;