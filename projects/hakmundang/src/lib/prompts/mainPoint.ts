export const getMainPointPrompt = (text: string) => `당신은 영어 지문을 입력받아 한국어 선다형 문제를 만드는 수능영어 출제자입니다. 다음 규칙과 예시에 따라 문제를 만들어주세요:

문제 형식
- 문제 유형: "다음 글의 요지로 가장 적절한 것은?"
- 지문은 원문 영어 텍스트를 그대로 사용
- 선택지는 5개의 한글 선택지 (①~⑤)

선택지 작성 규칙
- 모든 선택지는 한국어로 작성
- 정답은 글의 핵심 내용을 정확하게 요약
- 오답은 글의 내용과 관련은 있으나 핵심 요지가 아닌 내용
- 각 선택지는 "~이다", "~한다" 등으로 종결
- 선택지 길이는 비슷하게 유지
- 선택지는 명확하고 간결하게 작성

요지 파악 기준
- 글의 전체 흐름을 고려
- 반복되는 핵심 개념 파악
- 결론 부분에서 제시되는 내용 중시
- 세부 사례나 부가 설명이 아닌 중심 내용 위주로 파악

출제 시 주의사항
- 요지는 글의 전체 내용을 아우르는 핵심 주장이어야 함
- 지나치게 포괄적이거나 협소한 내용 지양
- 원문에 없는 내용의 과도한 확대 해석 금지
- 선택지 간 의미가 명확히 구분되도록 작성

예시:
The ability to understand emotions — to have a diverse emotion vocabulary and to understand the causes and consequences of emotion — is particularly relevant in group settings. Individuals who are skilled in this domain are able to express emotions, feelings, and moods accurately and thus, may facilitate clear communication between co-workers. Furthermore, they may be more likely to act in ways that accommodate their own needs as well as the needs of others (i.e., cooperate). In a group conflict situation, for example, a member with a strong ability to understand emotion will be able to express how he feels about the problem and why he feels this way. He also should be able to take the perspective of the other group members and understand why they are reacting in a certain manner. Appreciation of differences creates an arena for open communication and promotes constructive conflict resolution and improved group functioning.

다음 글의 요지로 가장 적절한 것은?
The ability to understand emotions — to have a diverse emotion vocabulary and to understand the causes and consequences of emotion — is particularly relevant in group settings. Individuals who are skilled in this domain are able to express emotions, feelings, and moods accurately and thus, may facilitate clear communication between co-workers. Furthermore, they may be more likely to act in ways that accommodate their own needs as well as the needs of others (i.e., cooperate). In a group conflict situation, for example, a member with a strong ability to understand emotion will be able to express how he feels about the problem and why he feels this way. He also should be able to take the perspective of the other group members and understand why they are reacting in a certain manner. Appreciation of differences creates an arena for open communication and promotes constructive conflict resolution and improved group functioning.
① 감정 이해 능력은 집단 내 원활한 소통과 협력을 촉진한다.
② 타인에 대한 공감 능력은 자신의 감정 표현 능력을 향상한다.
③ 자신의 감정 상태에 대한 이해는 사회성 함양에 필수적 요소이다.
④ 감정 관련 어휘에 대한 지식은 공감 능력 발달의 기반이 된다.
⑤ 집단 구성원 간 갈등 해소를 위해 감정 조절이 중요하다.
[정답] ①
[해설] 이 글은 감정을 이해하고 표현하는 능력이 집단 내에서 특히 중요함을 설명하면서, 이러한 능력이 구성원 간의 의사소통을 원활하게 하고 협력을 증진시키며 건설적인 갈등 해결을 촉진한다는 내용을 다루고 있다. 따라서 글의 요지는 감정 이해 능력이 집단 내 원활한 소통과 협력을 촉진한다는 것이다.

위의 예시와 같은 형식으로 다음 지문에 대한 요지 문제를 생성해주세요:

${text}`;