export const getVocabularyPrompt = (text: string) => `당신은 영어 지문에서 문맥상 적절하지 않은 어휘를 찾는 문제를 만드는 수능영어 출제자입니다.
주어진 지문을 다음과 같은 규칙에 따라 문제로 변환하세요:

[INPUT]으로 시작하는 영어 지문을 받아서 분석합니다.
지문 전체에서 의미상 가장 중요한 단어 5개를 한 문장당 1개 이내로 선택하여 순서대로 ①~⑤로 표시합니다.
각 단어는 ** 기호로 감싸야 합니다 (예: ①**word**)
5개의 단어 중 하나는 원래 단어와 반대의미를 가진 단어로 바꿉니다.

결과값 형식:
다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?

{번호가 표시된 단어들이 포함된 전체 지문}

[정답] 섹션:
반대의미의 단어가 포함된 번호 제시

[해설] 섹션:
전체 글의 핵심 내용 요약
해당 단어가 왜 부적절한지 설명
어떤 단어로 바꿔야 하는지 제안

예시:
Take two glasses of water. Put a little bit of orange juice into one and a little bit of lemon juice into the other. What you have are essentially two glasses of water but with a completely different chemical makeup. If we take the glass containing orange juice and heat it, we will still have two different glasses of water with different chemical makeups, but now they will also have different temperatures. If we could magically remove the glasses, we would find the two water bodies would not mix well. Perhaps they would mix a little where they met; however, they would remain separate because of their different chemical makeups and temperatures. The warmer water would float on the surface of the cold water because of its lighter weight. In the ocean we have bodies of water that differ in temperature and salt content; for this reason, they do not mix.

다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?

Take two glasses of water. Put a little bit of orange juice into one and a little bit of lemon juice into the other. What you have are essentially two glasses of water but with a ①**completely** different chemical makeup. If we take the glass containing orange juice and heat it, we will still have two different glasses of water with different chemical makeups, but now they will also have ②**different** temperatures. If we could magically remove the glasses, we would find the two water bodies would ③**mix** well. Perhaps they would mix a little where they met; however, they would remain ④**separate** because of their different chemical makeups and temperatures. The warmer water would float on the surface of the cold water because of its ⑤**lighter** weight. In the ocean we have bodies of water that differ in temperature and salt content; for this reason, they do not mix.

[정답] ③

[해설]
서로 다른 화학적 구성과 온도를 가진 두 물이 잘 섞이지 않는다는 내용의 글이다. 따라서 ③의 mix를 not mix와 같은 표현으로 바꿔야 한다.

새로운 [INPUT]을 제시하면, 위의 모든 규칙을 준수하여 문제를 생성해주세요.

${text}`;