
export const getSummaryVocabPrompt = (text: string) => `# 영어 지문 서답형 문제 생성 프롬프트

다음 영어 지문을 읽고 아래 형식에 따라 서답형 문제를 생성해주세요:

## 생성 형식:

**[서답형]** 다음 글의 내용을 한 문장으로 요약하고자 한다. <보기>에 주어진 단어를 모두 사용하여 문장을 완성하시오.
[영어 지문 원문]
[지문의 핵심 내용을 바탕으로 한 불완전한 문장]. _____________________________________.

**< 보기 >** [문장 완성에 필요한 6-8개의 단어들을 순서 없이 나열]

**[정답]** [보기의 모든 단어를 사용하여 완성된 문장]

## 생성 규칙:

1. **지문 분석**: 영어 지문의 핵심 주제와 결론을 파악
2. **문장 구성**: 지문의 요점을 담은 불완전한 한국어/영어 혼합 문장 작성
3. **보기 단어**: 빈칸에 들어갈 구문을 구성하는 6-8개 단어를 순서 없이 제시
4. **정답 작성**: 보기의 모든 단어를 문법에 맞게 배열한 완전한 구문

## 주의사항:
- 보기의 모든 단어는 반드시 사용되어야 함
- 문법적으로 올바른 영어 구문이 되어야 함
- 지문의 핵심 내용을 정확히 반영해야 함
- 단어의 형태 변화는 허용하지 않음 (주어진 형태 그대로 사용)

## 예시:

**입력 지문:**
In their study in 2007 Katherine Kinzler and her colleagues at Harvard showed that our tendency to identify with an in-group to a large degree begins in infancy and may be innate. Kinzler and her team took a bunch of five-month-olds whose families only spoke English and showed the babies two videos. In one video, a woman was speaking English. In the other, a woman was speaking Spanish. Then they were shown a screen with both women side by side, not speaking. In infant psychology research, the standard measure for affinity or interest is attention — babies will apparently stare longer at the things they like more. In Kinzler's study, the babies stared at the English speakers longer. In other studies, researchers have found that infants are more likely to take a toy offered by someone who speaks the same language as them. Psychologists routinely cite these and other experiments as evidence of our built-in propensity to prefer "our own kind."

**생성 결과:**

**[서답형]** 다음 글의 내용을 한 문장으로 요약하고자 한다. <보기>에 주어진 단어를 모두 사용하여 문장을 완성하시오.
In their study in 2007 Katherine Kinzler and her colleagues at Harvard showed that our tendency to identify with an in-group to a large degree begins in infancy and may be innate. Kinzler and her team took a bunch of five-month-olds whose families only spoke English and showed the babies two videos. In one video, a woman was speaking English. In the other, a woman was speaking Spanish. Then they were shown a screen with both women side by side, not speaking. In infant psychology research, the standard measure for affinity or interest is attention — babies will apparently stare longer at the things they like more. In Kinzler's study, the babies stared at the English speakers longer. In other studies, researchers have found that infants are more likely to take a toy offered by someone who speaks the same language as them. Psychologists routinely cite these and other experiments as evidence of our built-in propensity to prefer "our own kind."
Infants' more favorable responses to those who speak a familiar language show that there can be _____________________________________.

**< 보기 >** an intrinsic / prefer / in-group / tendency / members / to

**[정답]** an intrinsic tendency to prefer in-group members

---

**사용법**: 이 프롬프트 다음에 분석하고자 하는 영어 지문을 입력하세요.

---

**지문:**
${text}`;
