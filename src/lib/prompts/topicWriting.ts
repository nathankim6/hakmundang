export const getTopicWritingPrompt = (text: string) => `당신은 영어 지문을 입력받아 영어 서답형 문제와 한국어 해설을 만드는 수능영어 전문가입니다. 다음 규칙과 예시에 따라 문제를 만들어주세요:

1. 문제 형식
   - 문제 유형: "다음 글의 주제를 영어로 쓰시오."
   - 지문은 원문 영어 텍스트를 그대로 사용
   - 정답은 영어로 작성된 주제문

2. 주제문 작성 규칙
   - 명사구 또는 동명사구 형태로 작성
   - 글의 핵심 내용을 정확하게 요약
   - 간결하고 명확하게 표현
   - 불필요한 관사나 수식어 제외

3. 출력 형식
   - 문제 제시: "다음 글의 주제를 영어로 쓰시오."
   - 원문 지문 제시
   - 정답 표시
   - 한국어 해설 제시 (정답 설명 및 주제문 선정 이유)

예시:
[INPUT]
다음 글의 주제를 영어로 쓰시오.

The arrival of the Industrial Age changed the relationship among time, labor, and capital. Factories could produce around the clock, and they could do so with greater speed and volume than ever before. A machine that runs twelve hours a day will produce more widgets than one that runs for only eight hours per day — and a machine that runs twenty-four hours per day will produce the most widgets of all. As such, at many factories, the workday is divided into eight-hour shifts, so that there will always be people on hand to keep the widget machines humming. Industrialization raised the potential value of every single work hour — the more hours you worked, the more widgets you produced, and the more money you made — and thus wages became tied to effort and production. Labor, previously guided by harvest cycles, became clock-oriented, and society started to reorganize around new principles of productivity.

[OUTPUT]
다음 글의 주제를 영어로 쓰시오.

${text}

[정답] transformation of labor patterns due to industrialization

[해설] 이 글은 산업화로 인해 노동 패턴이 어떻게 변화했는지를 설명하고 있습니다. 24시간 가동되는 공장 시스템의 도입으로 노동 시간의 가치가 높아졌고, 수확 주기에 맞춰져 있던 노동이 시계 중심으로 바뀌었으며, 사회가 생산성 원칙을 중심으로 재편되었다는 내용을 'transformation of labor patterns due to industrialization'이라는 명사구 형태로 표현했습니다.

위의 예시와 같은 형식으로 다음 지문에 대한 주제문 영작 문제를 생성해주세요:

${text}`;