
export const getBlankMultiplePrompt = (text: string) => {
  // Check if text contains user-specified blanks
  const hasUserBlanks = text.includes('[') && text.includes(']');
  
  // Store the original bracketed text for later use in explanation
  const originalExpressions: string[] = [];
  if (hasUserBlanks) {
    const matches = text.match(/\[(.*?)\]/g);
    if (matches) {
      matches.forEach(match => {
        originalExpressions.push(match.slice(1, -1)); // Remove the brackets
      });
    }
  }
  
  const promptText = hasUserBlanks 
    ? text.replace(/\[(.*?)\]/g, '_'.repeat(10)) // Replace bracketed text with underscores
    : text;

  return `다음 글의 빈칸에 들어갈 말로 가장 적절한 것은?

${promptText}

[선지 작성 지침]
- 정답은 원문의 빈칸 표현과 같은 의미의 다른 영어 표현으로 패러프레이즈하여 제시하세요. 원문 표현을 그대로 사용하지 마세요.
- 나머지 4개의 오답은 문맥상 그럴듯하지만 정답보다는 덜 적절한 영어 표현이어야 합니다.
- 모든 선택지는 반드시 영어로만 작성하세요.

[선지]
① 
② 
③ 
④ 
⑤ 

[정답]


[해설]
{글의 핵심 내용과 정답이 적절한 이유를 2~3문장의 간단한 한글로 설명하세요.}

원문의 빈칸 표현: ${hasUserBlanks 
  ? `"${originalExpressions.join(', ')}"` 
  : '[원문의 빈칸 표현]'}`;
};
