export const getSummaryBlankPrompt = (text: string) => `[INPUT]
${text}

[OUTPUT]
다음 글을 읽고, 물음에 답하시오.

${text}

[문제]
다음 글의 내용을 아래와 같이 요약하고자 한다. 빈칸 (A), (B), (C)에 들어갈 말로 가장 적절한 것을 본문에서 찾아서 그대로 쓰시오.

[요약문]
{Write a summary sentence with blanks (A), (B), and (C)}

[정답]
(A) {Word or phrase from the text}
(B) {Word or phrase from the text}
(C) {Word or phrase from the text}`;