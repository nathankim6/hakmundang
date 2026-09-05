export const getOrderWritingKoreanPrompt = (text: string) => `사용자가 대괄호 []로 감싼 문장들을 배열영작 문제로 만들어주세요.

## 문제 생성 규칙:

1. **문장 선정**: 사용자가 대괄호 []로 감싼 문장들을 찾아서 문제로 출제
2. **한국어 번역**: 선택된 문장을 자연스러운 한국어로 번역하여 대괄호 안에 표시
3. **라벨링**: 감싸진 문장들을 순서대로 (A), (B), (C)... 로 표시

## 출력 형식:

[서답형] 다음 글을 읽고, 물음에 답하시오.

[원문 지문을 그대로 제시하되, 대괄호로 감싼 문장들을 (A), (B)로 표시하고 바로 뒤에 대괄호 안에 한국어 번역을 삽입]

(A)를 어법에 맞게 주어진 단어를 배열하시오.
[첫 번째 문장의 단어들을 무작위 순서로 나열, 마침표는 별도 표시]

(B)를 어법에 맞게 주어진 단어를 배열하시오.
[두 번째 문장의 단어들을 무작위 순서로 나열, 마침표는 별도 표시]

[정답]
(A) [올바른 어순의 완전한 문장]
(B) [올바른 어순의 완전한 문장]

## 예시:

**입력 지문:**
Despite all the high­tech devices that seem to deny the need for paper, paper use in the United States has nearly doubled recently. We now consume more paper than ever: 400 million tons globally and growing. Paper is not the only resource that we are using more of. Technological advances often come with the promise of using fewer materials. However, the reality is that they have historically caused more materials use, making us dependent on more natural resources. [The world now consumes far more "stuff" than it ever has.] We use twenty­seven times more industrial minerals, such as gold, copper, and rare metals, than we did just over a century ago. [We also each individually use more resources.] Much of that is due to our high­tech lifestyle.

**출력 결과:**
[서답형] 다음 글을 읽고, 물음에 답하시오.

Despite all the high­tech devices that seem to deny the need for paper, paper use in the United States has nearly doubled recently. We now consume more paper than ever: 400 million tons globally and growing. Paper is not the only resource that we are using more of. Technological advances often come with the promise of using fewer materials. However, the reality is that they have historically caused more materials use, making us dependent on more natural resources. (A) [세계는 이제 그 어느 때보다 훨씬 더 많은 "물건들"을 소비하고 있다.] We use twenty­seven times more industrial minerals, such as gold, copper, and rare metals, than we did just over a century ago. (B) [우리는 또한 각자 개별적으로도 더 많은 자원을 사용한다.] Much of that is due to our high­tech lifestyle.

(A)를 어법에 맞게 주어진 단어를 배열하시오.
now / far / world / consumes / "stuff" / more / the / than / has. / it / ever

(B)를 어법에 맞게 주어진 단어를 배열하시오.
individually / also / we / each / more / resources. / use

[정답]
(A) The world now consumes far more "stuff" than it ever has.
(B) We also each individually use more resources.

---

**지문:**
${text}`;