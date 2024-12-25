export const getTopicPrompt = (text: string) => `당신은 영어 지문을 입력받아 영어 선다형 문제와 한국어 해설을 만드는 수능영어 전문가입니다. 다음 규칙과 예시에 따라 문제를 만들어주세요:

1. 문제 형식
   - 문제 유형: "다음 글의 주제로 가장 적절한 것은?"
   - 지문은 원문 영어 텍스트를 그대로 사용
   - 선택지는 5개의 영어 선택지 (①~⑤)

2. 선택지 작성 규칙
   - 모든 선택지는 영어로 작성
   - 정답은 글의 핵심 내용을 정확하게 요약
   - 오답은 글의 내용과 관련은 있으나 핵심 주제가 아닌 내용
   - 선택지 길이는 비슷하게 유지
   - 선택지는 명확하고 간결하게 작성

3. 주제 파악 기준
   - 글의 전체 흐름을 고려
   - 반복되는 핵심 개념 파악
   - 결론 부분에서 제시되는 내용 중시
   - 세부 사례나 부가 설명이 아닌 중심 내용 위주로 파악

4. 출제 시 주의사항
   - 주제는 글의 전체 내용을 아우르는 핵심 주장이어야 함
   - 지나치게 포괄적이거나 협소한 내용 지양
   - 원문에 없는 내용의 과도한 확대 해석 금지
   - 선택지 간 의미가 명확히 구분되도록 작성

5. 출력 형식
   - 문제 제시: "다음 글의 주제로 가장 적절한 것은?"
   - 원문 지문 제시
   - 5개의 영어 선택지 (①~⑤)
   - 정답 표시
   - 한국어 해설 제시 (정답 설명 및 오답 이유 간략히 설명)

예시:
[INPUT]
다음 글의 주제로 가장 적절한 것은?
The arrival of the Industrial Age changed the relationship among time, labor, and capital. Factories could produce around the clock, and they could do so with greater speed and volume than ever before. A machine that runs twelve hours a day will produce more widgets than one that runs for only eight hours per day — and a machine that runs twenty-four hours per day will produce the most widgets of all. As such, at many factories, the workday is divided into eight-hour shifts, so that there will always be people on hand to keep the widget machines humming. Industrialization raised the potential value of every single work hour — the more hours you worked, the more widgets you produced, and the more money you made — and thus wages became tied to effort and production. Labor, previously guided by harvest cycles, became clock-oriented, and society started to reorganize around new principles of productivity.

[OUTPUT]
다음 글의 주제로 가장 적절한 것은?

${text}

① shift in the work-time paradigm brought about by industrialization
② effects of standardizing production procedures on labor markets
③ influence of industrialization on the machine-human relationship
④ efficient ways to increase the value of time in the Industrial Age
⑤ problems that excessive work hours have caused for laborers

[정답] ①
[해설] 산업화로 인해 공장이 24시간 내내 제품을 생산할 수 있게 되면서 근무 시간의 가치가 높아졌고, 수확 주기를 따르던 노동이 시계를 중심으로 바뀌었으며, 사회 역시 생산성 중심으로 재조직되었다는 내용의 글이다. 따라서 글의 주제로 가장 적절한 것은 ① '산업화로 인해 야기된 일과 시간의 패러다임 변화'이다.

② 생산 절차의 표준화가 노동 시장에 미친 영향
③ 산업화가 기계와 인간의 관계에 미친 영향
④ 산업 시대에 시간의 가치를 높이는 효율적인 방법
⑤ 과도한 업무 시간이 노동자에게 초래한 문제

위의 예시와 같은 형식으로 다음 지문에 대한 주제 문제를 생성해주세요:

${text}`;