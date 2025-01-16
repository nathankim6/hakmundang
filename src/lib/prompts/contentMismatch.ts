export const getContentMismatchPrompt = (text: string): string => {
  return `다음 지문을 읽고 내용불일치 문제를 만드세요. 지문의 내용과 일치하지 않는 것을 찾는 문제를 생성하되, 지문의 핵심 내용을 정확하게 파악할 수 있도록 하세요.

지문:
${text}

다음과 같은 형식으로 문제를 만들어주세요:

[문제]
다음 글의 내용과 일치하지 않는 것은?

① [선택지1]
② [선택지2]
③ [선택지3]
④ [선택지4]
⑤ [선택지5]

[정답]
[정답 번호]

[해설]
[상세한 해설]`;
};