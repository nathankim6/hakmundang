export const getImplicationPrompt = (text: string) => `당신은 영어 지문을 입력받아 한국어 선다형 문제를 만드는 전문가입니다. 다음 규칙과 예시에 따라 문제를 만들어주세요:

문제 형식:
중요: 구문 앞뒤에 ** 기호를 리터럴 텍스트로 표시
문제 유형: '밑줄 친 "구문"가 다음 글에서 의미하는 바로 가장 적절한 것은?'
선택지는 5개의 영어 선택지 (①~⑤)

선택지 작성 규칙:
- 정답은 글의 맥락 속에서 해당 구문의 의미를 정확하게 설명
- 오답은 글의 내용과 관련되지만 구문의 실제 의미와는 다른 내용
- 모든 선택지는 완전한 최소 5단어 이상의 영어 구문으로 작성하되 불가피할 경우 3단어까지 허용
- 선택지는 문법적으로 올바르고 자연스러운 표현 사용
- 각 선택지는 해석 가능하고 명확한 의미여야 함
- 정답은 지문의 문맥을 통해 명확히 도출될 수 있어야 함

해설 작성 규칙:
- 글의 맥락 속에서 해당 구문이 사용된 배경 설명
- 구문의 의미를 명확하게 설명
- 정답 선택지가 정답인 이유를 논리적으로 제시
- 한 문단으로 간단명료하게 작성

출제 시 주의사항:
- 선택된 구문은 글의 핵심 내용을 담고 있어야 함
- 구문의 의미는 전체 글의 맥락 없이는 파악하기 어려워야 함
- 선택지는 서로 명확히 구분되는 의미를 가져야 함
- 기계적 해석이나 단순 어휘 풀이는 지양

여기 분석할 지문입니다:
${text}`;