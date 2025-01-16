export const getIllustrationPrompt = (text: string) => {
  return `다음 글을 읽고 삽화를 제작하기 위한 지시사항을 작성하시오.

${text}

[문제]
위 글의 내용을 시각적으로 표현하기 위한 삽화를 제작하려고 합니다. 삽화에 포함되어야 할 요소들을 구체적으로 설명하시오.

[정답]`;
};