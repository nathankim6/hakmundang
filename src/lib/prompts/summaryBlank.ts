export const getSummaryBlankPrompt = (text: string) => `당신은 영어 교육 자료 제작 전문가입니다. 제공된 영어 지문을 분석하여 "요약문 빈칸" 유형의 문제를 만들어주세요.

다음 지침을 따라주세요:
[OUTPUT] 섹션에서는:
첫 줄에 "다음 글의 내용을 아래와 같이 요약하고자 한다. 빈칸 (A), (B), (C)에 들어갈 말로 가장 적절한 것을 본문에서 찾아서 그대로 쓰시오." 표시
두 번째 줄부터 원본 지문을 그대로 표시
그 다음 줄에 [문제] 섹션 표시
그 다음 줄에 [요약문] 섹션에 빈칸이 포함된 요약문을 작성 (반드시 본문의 핵심 내용을 포함)

[정답] 섹션에서는:
"[정답]"으로 시작
그 밑에 (A), (B), (C)의 정답을 각각 새로운 줄에 작성
해설은 작성하지 않음

${text}`;