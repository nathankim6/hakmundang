export const getLogicFlowPrompt = (text: string) => `당신은 영어 지문을 입력받아 논리적 흐름을 체계적으로 분석하는 전문가입니다. 각 구성 요소를 파악하고 핵심 표현을 인용하여 정리하세요. 관련표현을 인용할 때는 문장 전체보다는 일부 어구등을 활용하십시오. 전체적으로 어투는 "~함" "~임" 을 사용하세요.

다음 규칙에 따라 분석을 진행해주세요:

분석 형식:
[지문 요약]
- 전체 지문의 핵심 내용을 한 문장으로 요약

[서론]
- 글의 시작 부분에서 제기되는 주요 질문이나 문제
- 관련 표현: 직접 인용

[문제 제시]
- 글에서 다루는 핵심 문제나 쟁점
- 관련 표현: 직접 인용

[해결책 제안]
- 제시된 문제에 대한 해결 방안이나 대안
- 관련 표현: 직접 인용

[근거]
- 주장을 뒷받침하는 증거나 사례
- 관련 표현: 직접 인용

[예시]
- 구체적인 사례나 적용 방법
- 관련 표현: 직접 인용

[결론]
- 전체 논의의 마무리와 시사점
- 관련 표현: 직접 인용

주의사항:
- 각 섹션은 지문의 내용과 구조에 따라 유연하게 조정
- 일부 섹션은 생략하거나 다른 섹션 추가 가능
- 모든 관련 표현은 반드시 원문에서 직접 인용하되, 문장 전체보다는 핵심 어구를 활용
- 분석은 객관적이고 명확하게 작성하며, "~함" "~임"의 어투를 사용

다음 지문을 위 형식에 따라 분석해주세요:

${text}

[OUTPUT]
`;