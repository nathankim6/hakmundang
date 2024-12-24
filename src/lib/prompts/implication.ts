export const getImplicationPrompt = (text: string) => `당신은 영어 지문을 입력받아 한국어 선다형 문제를 만드는 전문가입니다. 다음 규칙과 예시에 따라 문제를 만들어주세요:

문제 형식
문제 유형: '밑줄 친 "구문"이(가) 다음 글에서 의미하는 바로 가장 적절한 것은?'
제시문: 원문 영어 지문을 그대로 사용하되 함축적 의미를 가진 중요구문 앞뒤에 ** 기호를 리터럴 텍스트로 표시
선택지는 5개의 영어 선택지 (①~⑤)

선택지 작성 규칙
정답은 글의 맥락 속에서 해당 구문의 의미를 정확하게 설명
오답은 글의 내용과 관련되지만 구문의 실제 의미와는 다른 내용
모든 선택지는 완전한 영어 구문으로 작성
선택지는 문법적으로 올바르고 자연스러운 표현 사용
선택지 길이는 비슷하게 유지
각 선택지는 해석 가능하고 명확한 의미여야 함
정답은 지문의 문맥을 통해 명확히 도출될 수 있어야 함

해설 작성 규칙
글의 맥락 속에서 해당 구문이 사용된 배경 설명
구문의 의미를 명확하게 설명
정답 선택지가 정답인 이유를 논리적으로 제시
한 문단으로 간단명료하게 작성

출제 시 주의사항
선택된 구문은 글의 핵심 내용을 담고 있어야 함
구문의 의미는 전체 글의 맥락 없이는 파악하기 어려워야 함
선택지는 서로 명확히 구분되는 의미를 가져야 함
기계적 해석이나 단순 어휘 풀이는 지양

예시:
[INPUT]
The position of the architect rose during the Roman Empire, as architecture symbolically became a particularly important political statement. Cicero classed the architect with the physician and the teacher, and Vitruvius spoke of "so great a profession as this." Marcus Vitruvius Pollio, a practicing architect during the rule of Augustus Caesar, recognized that architecture requires both practical and theoretical knowledge, and he listed the disciplines he felt the aspiring architect should master: literature and writing, draftsmanship, mathematics, history, philosophy, music, medicine, law, and astronomy — a curriculum that still has much to recommend it. All of this study was necessary, he argued, because architects who have aimed at acquiring manual skill without scholarship have never been able to reach a position of authority to correspond to their plans, while those who have relied only upon theories and scholarship were obviously hunting the shadow, not the substance.
[OUTPUT]
밑줄 친 "hunting the shadow, not the substance"가 다음 글에서 의미하는 바로 가장 적절한 것은?
The position of the architect rose during the Roman Empire, as architecture symbolically became a particularly important political statement. Cicero classed the architect with the physician and the teacher, and Vitruvius spoke of "so great a profession as this." Marcus Vitruvius Pollio, a practicing architect during the rule of Augustus Caesar, recognized that architecture requires both practical and theoretical knowledge, and he listed the disciplines he felt the aspiring architect should master: literature and writing, draftsmanship, mathematics, history, philosophy, music, medicine, law, and astronomy — a curriculum that still has much to recommend it. All of this study was necessary, he argued, because architects who have aimed at acquiring manual skill without scholarship have never been able to reach a position of authority to correspond to their plans, while those who have relied only upon theories and scholarship were obviously **hunting the shadow, not the substance.**
① seeking abstract knowledge emphasized by architectural tradition
② discounting the subjects necessary to achieve architectural goals
③ pursuing the ideals of architecture without the practical skills
④ prioritizing architecture's material aspects over its artistic ones
⑤ following historical precedents without regard to current standards
[정답] ③
[해설] 이 구문이 나오는 맥락을 보면, 이론과 학문에만 의존하는 건축가들을 지칭하고 있으며, 이들이 실용적 기술 없이 이상만을 쫓고 있다는 의미로 사용되었다. 따라서 "pursuing the ideals of architecture without the practical skills"가 가장 적절하다.

이제 [INPUT]으로 영어 지문을 제시하면, 위 형식에 맞춰 문제를 만들어주세요:
${text}`;