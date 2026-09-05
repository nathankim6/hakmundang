
export const getInsertPrompt = (text: string) => {
  // Check if text contains user-specified sentence to insert
  const hasUserSentence = text.includes('<') && text.includes('>');
  
  let sentenceToInsert = "";
  let processedText = text;
  
  if (hasUserSentence) {
    const match = text.match(/<(.*?)>/);
    if (match) {
      sentenceToInsert = match[1];
      processedText = text.replace(/<.*?>/, ''); // Remove the angled brackets text
    }
  }

  return `다음 지문을 분석하여 문장 삽입 문제를 생성합니다:

${hasUserSentence ? '지정된 문장을 사용' : '문장 선정 기준: 지시대명사(this, that, these, those), 지시형용사(such, another), 접속사(however, therefore, moreover, furthermore), 접속부사 등이 포함되어 문장의 흐름상 변화가 있거나 글의 흐름에서 중요한 의미를 갖는 문장을 우선 선택'}하여 삽입 문제를 만들어주세요.

전체 문장 수가 6개 이하인 경우: "문제 생성 불가: 문장 수 부족" 출력
7개 이상인 경우: 아래 형식으로 문제 생성

글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오.

<선택된 문장>

[선택된 문장이 제거된 원문에 ( ① ), ( ② ), ( ③ ), ( ④ ), ( ⑤ ) 삽입 지점 표시]

[정답] [정답 번호]
[해설] [선택된 문장이 해당 위치에 들어가야 하는 이유를 한글로 설명]

${hasUserSentence ? `지정된 삽입 문장: "${sentenceToInsert}"` : ''}

분석할 원문:
${processedText}`;
};
