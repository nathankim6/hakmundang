export const getTitlePrompt = (text: string) => `당신은 영어 지문을 입력받아 영어 선다형 문제와 한국어 해설을 만드는 전문가입니다. 다음 규칙에 따라 문제를 만들어주세요:

문제 형식
- 문제 유형: "다음 글의 제목으로 가장 적절한 것은?"
- 지문은 원문 영어 텍스트를 그대로 사용
- 선택지는 5개의 영어 선택지 (①~⑤)

선택지 작성 규칙
- 모든 선택지는 영어로 작성
- 정답은 글의 핵심 내용을 정확하게 요약
- 오답은 글의 내용과 관련은 있으나 핵심 주제가 아닌 내용
- 선택지 길이는 비슷하게 유지
- 선택지는 명확하고 간결하게 작성

제목 파악 기준
- 글의 전체 흐름을 고려
- 반복되는 핵심 개념 파악
- 결론 부분에서 제시되는 내용 중시
- 세부 사례나 부가 설명이 아닌 중심 내용 위주로 파악

출제 시 주의사항
- 제목은 글의 전체 내용을 아우르는 핵심 주장이어야 함
- 지나치게 포괄적이거나 협소한 내용 지양
- 원문에 없는 내용의 과도한 확대 해석 금지
- 선택지 간 의미가 명확히 구분되도록 작성

출력 형식
[OUTPUT]
다음 글의 제목으로 가장 적절한 것은?

${text}

① [영어 선택지 1]
② [영어 선택지 2]
③ [영어 선택지 3]
④ [영어 선택지 4]
⑤ [영어 선택지 5]

[정답] [정답 번호]
[해설] [한국어로 정답 설명 및 오답 이유 간략히 설명]

예시:
[INPUT]
The selfie resonates not because it is new, but because it expresses, develops, expands, and intensifies the long history of the self-portrait. The self-portrait showed to others the status of the person depicted. In this sense, what we have come to call our own "image" — the interface of the way we think we look and the way others see us — is the first and fundamental object of global visual culture. The selfie depicts the drama of our own daily performance of ourselves in tension with our inner emotions that may or may not be expressed as we wish. At each stage of the self-portrait's expansion, more and more people have been able to depict themselves. Today's young, urban, networked majority has reworked the history of the self-portrait to make the selfie into the first visual signature of the new era.

[OUTPUT]
다음 글의 제목으로 가장 적절한 것은?

The selfie resonates not because it is new, but because it expresses, develops, expands, and intensifies the long history of the self-portrait. The self-portrait showed to others the status of the person depicted. In this sense, what we have come to call our own "image" — the interface of the way we think we look and the way others see us — is the first and fundamental object of global visual culture. The selfie depicts the drama of our own daily performance of ourselves in tension with our inner emotions that may or may not be expressed as we wish. At each stage of the self-portrait's expansion, more and more people have been able to depict themselves. Today's young, urban, networked majority has reworked the history of the self-portrait to make the selfie into the first visual signature of the new era.

① Are Selfies Just a Temporary Trend in Art History?
② Fantasy or Reality: Your Selfie Is Not the Real You
③ The Selfie: A Symbol of Self-oriented Global Culture
④ The End of Self-portraits: How Selfies Are Taking Over
⑤ Selfies, the Latest Innovation in Representing Ourselves

[정답] ⑤
[해설] 셀피는 자화상의 오랜 역사를 표현하고 발전시키는 동시에 우리의 내면적 감정과 일상적 수행을 그려내며, 점점 더 많은 사람이 자신을 표현할 수 있게 되면서 새로운 시대의 시각적 특징이 되었다는 내용의 글이다. 따라서 글의 제목으로 가장 적절한 것은 ⑤ '셀피, 우리 자신을 표현하는 최신 혁신'이다.

위의 예시와 같은 형식으로 다음 지문에 대한 제목 문제를 생성해주세요:

${text}`;