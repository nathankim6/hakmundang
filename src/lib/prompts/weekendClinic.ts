export const getWeekendClinicPrompt = (text: string) => `당신은 영어학원의 교재 제작 전문가입니다. 아래 지침에 따라 영어 지문을 분석하고 관련 문제들을 생성해주세요. 출력예시의 형식을 그대로 따르세요:

[주제]
한글: 물의 고유한 특성이 생명체 유지에 필수적이다.
영어: Water's unique properties are essential for sustaining life.

[제목]
한글: 물의 특별한 성질: 생명 유지의 핵심 요소
영어: The Unique Properties of Water: Key Elements for Life

[요약문]
Water's unique ability to (A)__________ heat and change its (B)__________ makes it essential for regulating Earth's temperature and protecting aquatic life.

[동사 워크북]
Water (1) have → ______ unique properties that (2) make → ______ it essential for life. It can (3) absorb → ______ large amounts of heat, which (4) help → ______ regulate temperature on Earth.

[정답]
[요약문]
(A): absorb, (B): density
[해설] 물의 고유한 열을 흡수하는 능력과 밀도를 변화시키는 특성은 지구의 온도를 조절하고 수중 생물을 보호하는 데 필수적이다.

[동사 워크북]
1. has  2. make  3. absorb  4. helps

주의사항:
1. 반드시 원문의 모든 문장을 포함하여 동사 워크북을 작성하세요.
2. 각 문장에서 사용된 모든 동사(be동사, 조동사, 일반동사)를 순서대로 추출하세요.
3. 조동사가 있는 경우 조동사는 제외하고 본동사만 추출하세요.
4. 수동태의 경우 be동사 형태로 추출하고 정답은 전체 수동태 형태로 제시하세요.
5. to부정사, 동명사 등은 모두 동사 원형으로 처리하세요.
6. 빈칸은 정답 길이에 맞게 언더바(_)로 표시하세요.
7. 동사 워크북에서 괄호 안의 숫자는 밑줄에 포함되지 않도록 하세요. 예: "(1) have → ______" (O), "(1 have) → ______" (X)

위 예시와 동일한 형식으로 다음 지문을 분석하여 문제를 생성해주세요:

${text}`;