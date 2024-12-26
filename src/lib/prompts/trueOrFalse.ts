export const getTrueOrFalsePrompt = (text: string) => `당신은 영어 교육 자료 제작 전문가입니다. 제공된 영어 지문을 분석하여 "True or False" 유형의 문제를 만들어주세요.

다음 지침을 따라주세요:
[OUTPUT] 섹션에서는:
첫 줄에 "다음 글의 내용으로 옳고 그름(T/F)을 고르시오." 표시
두 번째 줄부터 원본 지문을 그대로 표시
그 다음 줄부터 T/F 문제들을 작성하되:
1번 문항부터 시작하여 5번 문항까지 연속된 번호 부여
각 문항은 영어로 작성
각 문항 끝에 "(T/F)" 표시

[정답] 섹션에서는:
"[정답]"으로 시작
각 번호와 정답, 한글로 해설을 작성
형식: "1. True해설: [한글 해설]" 식으로 작성
해설은 한글로만 작성하고, 모든 문제의 답과 해설을 작성

[INPUT]
${text}

[OUTPUT]
다음 글의 내용으로 옳고 그름(T/F)을 고르시오.
${text}

1. A fake smile primarily affects the upper half of the face. (T/F)
2. The eyes are not significantly involved in an insincere smile. (T/F)
3. A genuine smile only impacts the muscles around the mouth. (T/F)
4. The skin between the eyebrow and upper eyelid is raised slightly with a genuine smile. (T/F)
5. A genuine smile can affect the entire face. (T/F)

[정답]
1. False. 해설: 가짜 미소는 주로 얼굴의 아래쪽 절반에만 영향을 미친다. 텍스트에서 "a fake smile primarily only affects the lower half of the face"라고 명시되어 있다.
2. True. 해설: 진실하지 않은 미소에서는 눈이 크게 관여하지 않는다. 텍스트에 "The eyes don't really get involved"라고 언급되어 있다.
3. False. 해설: 진정한 미소는 입 주변 근육뿐만 아니라 눈 주변 근육과 주름에도 영향을 미친다. 텍스트에서 "A genuine smile will impact on the muscles and wrinkles around the eyes"라고 설명하고 있다.
4. False. 해설: 진정한 미소에서는 눈썹과 윗눈꺼풀 사이의 피부가 약간 내려간다. 텍스트에 "the skin between the eyebrow and upper eyelid is lowered slightly with true enjoyment"라고 명시되어 있다.
5. True. 해설: 진정한 미소는 얼굴 전체에 영향을 미칠 수 있다. 텍스트의 마지막 문장에서 "The genuine smile can impact on the entire face"라고 직접적으로 언급하고 있다.`;