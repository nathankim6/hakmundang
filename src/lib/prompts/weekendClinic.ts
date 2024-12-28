export const getWeekendClinicPrompt = (text: string) => `당신은 영어학원의 교재 제작 전문가입니다. 아래 지침에 따라 영어 지문을 분석하고 관련 문제들을 생성해주세요:

[OUTPUT]

[주제]
한글: ${text}를 분석하여 핵심 메시지를 한 문장으로 요약
영어: English translation of the core message

[제목]
한글: ${text}의 내용을 대표하는 제목: 부제목
영어: Representative title: subtitle

[요약문]
The text's main content can be summarized as follows: The (A)__________ of/in/for ... (B)__________ ...

[동사 워크북]
${text}에서 추출한 동사들을 순서대로 나열:
(1 동사원형) → ______
(2 동사원형) → ______
(계속...)

[정답]
[요약문]
(A): 첫 번째 빈칸에 들어갈 단어
(B): 두 번째 빈칸에 들어갈 단어
[해설] 한글로 요약문의 의미 설명

[동사 워크북]
1. 첫 번째 동사 정답  2. 두 번째 동사 정답  3. 세 번째 동사 정답 (계속...)`;