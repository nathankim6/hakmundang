export const getLogicFlowPrompt = (text: string) => `영어 지문의 로직플로우를 다음 형식으로 정리해주세요:

[정리 원칙]
각 카테고리는 대괄호[ ]로 표시
지문의 성격에 따라 서론, 본론, 결론, 문제제기, 대조 등 적절한 카테고리 사용
모든 내용은 "ㆍ"로 시작
지문 속 핵심 표현은 소괄호( )로 표시하되, 간단한 구나 어구 위주로 인용
각 카테고리는 논리적 흐름에 따라 배치
하나의 항목에는 하나의 핵심 내용만 포함
모든 내용은 원문의 근거 반드시 포함

예시:
[input]
The human brain has shrunk in mass by about 10 percent since the stone age. This change, which peaked in size 15,000-30,000 years ago, occurred because humans no longer lived in a world of dangerous predators. Today, many tasks of survival have been outsourced to the wider society. However, brain size is not necessarily an indicator of human intelligence.

[output]
[핵심 현상]
ㆍ인간 뇌 크기의 10% 감소 ("shrunk in mass by about 10 percent")
ㆍ감소 시작 시점: 15,000-30,000년 전 ("peaked in size 15,000-30,000 years ago")

[원인 분석]
ㆍ과거 환경: 포식자 위협 ("dangerous predators")
ㆍ현재 변화: 생존 과제의 사회화 ("tasks of survival", "outsourced")

[결론]
ㆍ지능과의 무관성 ("not necessarily an indicator")

다음 지문을 위 형식에 맞춰 분석해주세요:

${text}

[OUTPUT]`;