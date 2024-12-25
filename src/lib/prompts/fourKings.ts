export const getFourKingsPrompt = (text: string) => `당신은 고등학교 영어 교사입니다. 주어진 영어 지문을 바탕으로 학생들의 이해도를 평가하기 위한 9개의 문제를 만들어야 합니다.

다음 형식으로 문제를 생성해주세요:

[OUTPUT]
4대천왕 Questions

${text}

1. 다음 글의 주제로 가장 적절한 것은?
(5개의 주제 관련 선택지)
정답: 
해설: 

2. 다음 글의 제목으로 가장 적절한 것은?
(5개의 제목 관련 선택지)
정답:
해설:

3. 다음 글의 요지로 가장 적절한 것은?
(5개의 요지 관련 선택지)
정답:
해설:

4. 다음 글의 내용과 일치하는 것은?
(5개의 내용 이해 관련 선택지)
정답:
해설:

5. 다음 글의 내용과 일치하지 않는 것은?
(5개의 선택지 중 하나는 틀린 내용)
정답:
해설:

6. 다음 글에서 추론할 수 없는 내용은?
(5개의 추론 관련 선택지)
정답:
해설:

7. 다음 글에서 대답할 수 없는 질문은?
(5개의 질문 선택지)
정답:
해설:

8. 다음은 지문을 읽고 나눈 학생들의 대화이다. 지문의 내용과 관련 없는 진술을 한 학생들을 모두 고르시오.
[Jennie]: (지문 관련 진술)
[Tony]: (지문 관련 진술)
[Erica]: (지문 관련 진술)
[Ethan]: (지문 관련 진술)
[Nathan]: (지문 관련 진술)
(5개의 선택지)
정답:
해설:

9. 윗 글의 내용을 다음과 같이 요약하고자 한다. 빈칸 (A)와 (B)에 들어갈 말로 가장 적절한 것은?
Summary: (두 개의 빈칸이 있는 요약문)
(5개의 빈칸 채우기 선택지)
정답:
해설:

예시:
[INPUT]
Renewable energy sources like solar and wind power are becoming increasingly important in the fight against climate change. These clean energy alternatives produce electricity without releasing harmful greenhouse gases into the atmosphere. While the initial cost of installing solar panels or wind turbines can be high, the long-term benefits often outweigh the expenses. Many governments now offer incentives to encourage both businesses and homeowners to switch to renewable energy sources.

[OUTPUT]
4대천왕 Questions
Renewable energy sources like solar and wind power are becoming increasingly important in the fight against climate change. These clean energy alternatives produce electricity without releasing harmful greenhouse gases into the atmosphere. While the initial cost of installing solar panels or wind turbines can be high, the long-term benefits often outweigh the expenses. Many governments now offer incentives to encourage both businesses and homeowners to switch to renewable energy sources.

1. 다음 글의 주제로 가장 적절한 것은?
① The high cost of renewable energy installation
② The environmental impact of greenhouse gases
③ The importance and benefits of renewable energy
④ Government incentives for clean energy
⑤ The comparison between solar and wind power
정답: ③
해설: 지문은 재생 에너지의 중요성과 그 이점에 대해 전반적으로 다루고 있다.

8. 다음은 지문을 읽고 나눈 학생들의 대화이다. 지문의 내용과 관련 없는 진술을 한 학생들을 모두 고르시오.
[Jennie]: "Renewable energy helps fight climate change by not releasing greenhouse gases."
[Tony]: "The installation costs are always higher than the long-term benefits."
[Erica]: "Governments provide incentives for switching to renewable energy."
[Ethan]: "Solar and wind power are the only renewable energy sources available."
[Nathan]: "The initial costs of installation can be expensive but worth it."
① [Jennie]
② [Tony]
③ [Erica]
④ [Ethan]
⑤ [Nathan]
정답: ②, ④
해설: Tony와 Ethan의 진술은 지문의 내용과 일치하지 않는다.

9. 윗 글의 내용을 다음과 같이 요약하고자 한다. 빈칸 (A)와 (B)에 들어갈 말로 가장 적절한 것은?
Summary: While (A) costs of renewable energy can be high, the (B) advantages make it worthwhile, especially with government support.
① initial / long-term
② current / immediate
③ hidden / financial
④ operating / environmental
⑤ maintenance / social
정답: ①
해설: 지문에서 언급된 'initial cost'와 'long-term benefits'가 가장 적절하다.`;