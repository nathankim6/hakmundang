export const getWeekendClinicPrompt = (text: string) => `당신은 영어학원의 교재 제작 전문가입니다. 아래 지침에 따라 영어 지문을 분석하고 관련 문제들을 생성해주세요:

제공된 영어 지문을 그대로 표시합니다.

[주제] 섹션에서는:
- 지문의 핵심 메시지를 한 문장으로 요약
- 한글과 영어 버전 모두 제공
- 명확하고 간단한 문장으로 작성

[제목] 섹션에서는:
- 지문의 내용을 대표하는 제목 생성
- 콜론(:) 뒤에 부제목 추가
- 한글과 영어 버전 모두 제공

[요약문] 섹션에서는:
- 지문의 핵심 내용을 영어로 한 문장으로 요약
- 두 개의 빈칸 (A), (B) 포함
- 빈칸은 문맥상 가장 중요한 단어 선택

[동사 워크북] 섹션에서는:
- 지문에 나오는 모든 동사를 순서대로 추출
- 수동태, to부정사, 동명사 등 모든 동사 형태를 원형으로 처리
- 조동사 뒤의 동사는 조동사를 제외하고 동사 원형만 추출
예시:
- to play를 (4 play)→ __로 변형
- having been placed를 (7 place)→ __로 변형
- can absorb를 (3 absorb)→ __로 변형
- is destroyed를 (5 destroy)→ __로 변형
- 괄호 안에 동사 원형과 번호 표시
- 빈칸은 정답 길이에 맞게 언더바(_) 표시

[정답] 섹션에서는:
- 요약문의 빈칸 정답과 한글 해설
- 동사 워크북의 정답을 번호와 함께 한 줄로 나열

예시:
[INPUT]
Water has unique properties that make it essential for life. It can absorb large amounts of heat, which helps regulate temperature on Earth. Many organisms are supported by water's special characteristics. Water exists in three states: solid, liquid, and gas. When water freezes, it expands and becomes less dense, allowing ice to float on liquid water. This property protects aquatic life during winter by creating an insulating layer of ice on top of water bodies.

[OUTPUT]
Water has unique properties that make it essential for life. It can absorb large amounts of heat, which helps regulate temperature on Earth. Many organisms are supported by water's special characteristics. Water exists in three states: solid, liquid, and gas. When water freezes, it expands and becomes less dense, allowing ice to float on liquid water. This property protects aquatic life during winter by creating an insulating layer of ice on top of water bodies.

[주제]
한글: 물의 고유한 특성이 생명체 유지에 필수적이다.
영어: Water's unique properties are essential for sustaining life.

[제목]
한글: 물의 특별한 성질: 생명 유지의 핵심 요소
영어: The Unique Properties of Water: Key Elements for Life

[요약문]
Water's unique ability to (A)__ heat and change its (B)__ makes it essential for regulating Earth's temperature and protecting aquatic life.

[동사 워크북]
Water (1 have) → __ unique properties that (2 make) → __ it essential for life. It can (3 absorb) → __ large amounts of heat, which (4 help) → __ regulate temperature on Earth. Many organisms (5 be) → __ __ by water's special characteristics. Water (6 exist) → __ in three states. When water (7 freeze) → __, it (8 expand) → __ and (9 become) → __ less dense, (10 allow) → __ ice (11 float) → __ on liquid water. This property (12 protect) → __ aquatic life during winter by (13 create) → __ an insulating layer of ice.

[정답]
[요약문]
(A): absorb, (B): density
[해설] 물의 고유한 열을 흡수하는 능력과 밀도를 변화시키는 특성은 지구의 온도를 조절하고 수중 생물을 보호하는 데 필수적이다.

[동사 워크북]
1. has 2. make 3. absorb 4. helps 5. are supported 6. exists 7. freezes 8. expands 9. becomes 10. allowing 11. float 12. protects 13. creating

위의 지침과 예시에 따라 다음 영어 지문을 분석하고 문제를 생성해주세요:

${text}`;