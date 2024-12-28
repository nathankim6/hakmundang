export const getWeekendClinicPrompt = (text: string) => `당신은 영어학원의 교재 제작 전문가입니다. 아래 지침에 따라 영어 지문을 분석하고 관련 문제들을 생성해주세요:

[OUTPUT]

[주제]
한글: 지문의 핵심 메시지를 한 문장으로 요약
영어: The core message in one clear sentence

[제목]
한글: 지문의 내용을 대표하는 제목: 부제목
영어: Representative title: subtitle

[요약문]
The text's main content can be summarized as follows: The (A)__________ of/in/for ... (B)__________ ...

[동사 워크북]
다음 동사들의 알맞은 형태를 빈칸에 쓰시오:
(1 have) → ______
(2 make) → ______
(3 absorb) → ______
(4 help) → ______
(5 be) → ______
(6 exist) → ______
(7 freeze) → ______
(8 expand) → ______
(9 become) → ______
(10 allow) → ______

[정답]
[요약문]
(A): ________
(B): ________
[해설] 
한글로 요약문의 의미를 설명합니다.

[동사 워크북]
1. ______  2. ______  3. ______  4. ______  5. ______
6. ______  7. ______  8. ______  9. ______  10. ______

다음 지문을 분석해주세요:

${text}`;