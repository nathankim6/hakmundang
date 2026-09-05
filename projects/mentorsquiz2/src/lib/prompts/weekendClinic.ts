export const getWeekendClinicPrompt = (text: string) => `당신은 영어학원의 교재 제작 전문가입니다. 아래 지침에 따라 영어 지문을 분석하고 관련 문제들을 생성해주세요. 출력예시의 형식을 그대로 따르세요:

${text}

[주제] 섹션에서는:
지문의 핵심 메시지를 한 문장으로 요약
한글과 영어 버전 모두 제공
명확하고 간단한 문장으로 작성

[제목] 섹션에서는:
지문의 내용을 대표하는 제목 생성
콜론(:) 뒤에 부제목 추가
한글과 영어 버전 모두 제공

[요약문] 섹션에서는:
지문의 핵심 내용을 영어로 한 문장으로 요약
두 개의 빈칸 (A), (B) 포함
빈칸은 문맥상 가장 중요한 단어 선택

[True or False] 섹션에서는:
첫 줄에 "다음 글의 내용으로 옳고 그름(T/F)을 고르시오." 표시
그 다음 줄부터 지문을 바탕으로 T/F 문제들을 영어로 작성하되:
1번 문항부터 시작하여 5번 문항까지 연속된 번호 부여
각 문항 끝에 "(T/F)" 표시


[정답] 섹션에서는:
요약문의 빈칸 정답과 한글 해설
그 밑에 True or False 문제의 각 번호와 정답, 해설을 한글로 쓸 것.
형식: "1. True [해설]: 해설" 식으로 작성
만들어진 모든 문제의 답과 해설을 작성


출력예시:

[주제]
한글: 물의 고유한 특성이 생명체 유지에 필수적이다.
영어: Water's unique properties are essential for sustaining life.

[제목]
한글: 물의 특별한 성질: 생명 유지의 핵심 요소
영어: The Unique Properties of Water: Key Elements for Life

[요약문]
Water's unique ability to (A)__________ heat and change its (B)__________ makes it essential for regulating Earth's temperature and protecting aquatic life.

[True or False]
다음 글의 내용으로 옳고 그름(T/F)을 고르시오.
1. A fake smile primarily affects the upper half of the face. (T/F)
2. The eyes are not significantly involved in an insincere smile. (T/F)
3. A genuine smile only impacts the muscles around the mouth. (T/F)
4. The skin between the eyebrow and upper eyelid is raised slightly with a genuine smile. (T/F)
5. A genuine smile can affect the entire face. (T/F)


[정답]
[요약문 정답]
(A): absorb, (B): density
[해설] 물의 고유한 열을 흡수하는 능력과 밀도를 변화시키는 특성은 지구의 온도를 조절하고 수중 생물을 보호하는 데 필수적이다.

[True or False 정답]
1. False [해설]: 가짜 미소는 주로 얼굴의 아래쪽 절반에만 영향을 미친다. 텍스트에서 "a fake smile primarily only affects the lower half of the face"라고 명시되어 있다.
2. True [해설]: 진실하지 않은 미소에서는 눈이 크게 관여하지 않는다. 텍스트에 "The eyes don't really get involved"라고 언급되어 있다.
3. False [해설]: 진정한 미소는 입 주변 근육뿐만 아니라 눈 주변 근육과 주름에도 영향을 미친다. 텍스트에서 "A genuine smile will impact on the muscles and wrinkles around the eyes"라고 설명하고 있다.
4. False [해설]: 진정한 미소에서는 눈썹과 윗눈꺼풀 사이의 피부가 약간 내려간다. 텍스트에 "the skin between the eyebrow and upper eyelid is lowered slightly with true enjoyment"라고 명시되어 있다.
5. True [해설]: 진정한 미소는 얼굴 전체에 영향을 미칠 수 있다. 텍스트의 마지막 문장에서 "The genuine smile can impact on the entire face"라고 직접적으로 언급하고 있다.`;