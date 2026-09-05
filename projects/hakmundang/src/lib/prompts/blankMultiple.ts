
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
    ? text.replace(/\[(.*?)\]/g, '________________________________') // Replace bracketed text with fixed-length underscores
    : text;

  return `당신은 영어 지문을 입력받아 빈칸 채우기 문제를 만드는 수능 영어 전문가입니다. 다음 규칙에 따라 문제를 만들어주세요:

${hasUserBlanks 
  ? '대괄호로 표시된 부분들을 빈칸으로 만듭니다.'
  : '원문에서 가장 중요한 동사 구절 또는 완전한 문장을 선택하여 빈칸으로 만듭니다.'}
[OUTPUT] 섹션에 다음 내용을 포함합니다:
"다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오." 문장
빈칸을 포함한 전체 지문 (빈칸은 "________________________________"로 표시)

5개의 선택지를 만듭니다:
정답은 ${hasUserBlanks ? '대괄호 안에 있던 표현들' : '원문에서 제거한 동사 구절 또는 완전한 문장'}을 반드시 영어로 패러프레이즈해야 합니다. 이때, 원문의 핵심 의미는 유지하되 단어 선택, 어순, 또는 문장 구조를 변경하여 표현해야 합니다.
나머지 4개의 오답은 문맥상 그럴듯하지만 정답보다는 덜 적절해야 하며, 모두 영어로 작성합니다.

선택지들은 로마 숫자와 함께 나열합니다 (①, ②, ③, ④, ⑤).
[정답] 섹션에 정답 번호만 적습니다.
[해설] 섹션에 다음 내용을 포함한 해설을 작성합니다:
- 지문의 주요 내용 요약
- 정답이 가장 적절한 이유 설명
- 원문의 빈칸에 사용된 정확한 원래 표현: ${hasUserBlanks 
    ? `"${originalExpressions.join(', ')}"` 
    : '"[원문에서 제거한 표현]"'}
- 정답으로 제시된 패러프레이즈된 표현이 원문의 표현과 어떻게 같은 의미를 나타내는지 설명
- 각 오답에 대한 간단한 설명

모든 섹션을 연속해서 작성하고, 각 섹션 사이에 빈 줄을 넣지 않습니다.
문제를 만들 때마다 반드시 정답이 원문의 표현을 영어로 패러프레이즈한 것인지 다시 한 번 확인하세요.

위의 규칙에 따라 다음 지문에 대한 빈칸 문제를 생성해주세요:

${promptText}`;
};
