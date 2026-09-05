export const getContentInferencePrompt = (text: string) => `영어 지문 기반 추론 불가능한 사실 찾기 문제 생성 프롬프트

다음 영어 지문을 바탕으로 "다음 글의 내용을 읽고, 추론할 수 없는 사실은?" 형태의 객관식 문제를 만들어주세요.

**문제 생성 규칙:**
1. 선택지는 5개(①~⑤)로 구성
2. 4개는 지문에서 직접 언급되거나 합리적으로 추론 가능한 내용
3. 1개는 지문에서 전혀 언급되지 않았거나 추론할 수 없는 내용 (정답)
4. 오답 선택지들은 지문의 핵심 내용을 정확히 반영해야 함
5. 정답 선택지는 지문과 무관하거나 지문의 논조와 반대되는 내용

**선택지 작성 가이드:**
- 지문에서 직접 확인 가능한 사실 2-3개
- 지문 내용으로부터 논리적 추론이 가능한 사실 1-2개
- 지문에 없는 내용이지만 그럴듯해 보이는 함정 선택지 1개 (정답)

**예시:**
다음 글의 내용을 읽고, 추론할 수 없는 사실은?

There is a reason the title "Monday Morning Quarterback" exists. Just read the comments on social media from fans discussing the weekend's games, and you quickly see how many people believe they could play, coach, and manage sport teams more successfully than those on the field. This goes far the boardroom as well. Students and professionals with years of training and specialized degrees in sport business may also find themselves being given advice on how to do their jobs from friends, family, or even total strangers without any expertise. Executives in sport management have decades of knowledge and experience in their respective fields. However, many of them face criticism from fans and community members telling them how to run their business. Very few people tell their doctor how to perform surgery or their accountant how to prepare their taxes, but many people provide feedback on how sport organizations should be managed.

① There is a tendency where people feel confident offering opinions on subjects that they may not be formally trained in.
② Monday Morning Quarterback can develop critical thinking and analytical skills, creating vibrant and dynamic environment.
③ Even professionals with years of training may receive advice on their jobs from strangers lacking expertise.
④ Sports organizations are prone to Monday Morning Quarterback compared to other professional fields.
⑤ If someone always unfairly criticizes or questions the decisions of other people after something has happened, we can say that he or she is a Monday Morning Quarterback.

[정답] ②
[해설] Monday Morning Quarterback가 비판적 사고와 분석 능력을 기르고 활기차고 역동적인 환경을 만든다는 내용은 글 어디에도 언급되지 않았으며, 오히려 글의 전반적인 톤은 이런 현상에 대해 문제점을 지적하는 방향입니다.

**출력 형식:**
다음 글의 내용을 읽고, 추론할 수 없는 사실은?
[영어 지문]
① [선택지 1]
② [선택지 2] 
③ [선택지 3]
④ [선택지 4]
⑤ [선택지 5]
[정답] (해당 번호)
[해설] [정답인 이유와 왜 지문에서 추론할 수 없는지 설명]

**영어 지문:**
${text}`;