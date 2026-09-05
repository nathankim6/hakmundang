export const getOrderWritingPrompt = (text: string) => `사용자가 대괄호 []로 감싼 문장들을 배열영작 문제로 만들어주세요.

## 문제 생성 규칙:

1. **문장 선정**: 사용자가 대괄호 []로 감싼 문장들을 찾아서 문제로 출제
2. **라벨링**: 감싸진 문장들을 순서대로 (A), (B), (C)... 로 표시
3. **단어 배열**: 원문 문장의 단어들을 무작위로 섞어서 제시

## 출력 형식:

[서답형] 다음 글을 읽고, 물음에 답하시오.

[원문 지문을 그대로 제시하되, 대괄호로 감싼 문장들을 (A), (B)로 표시하고 해당 위치에 섞인 단어들을 대괄호 안에 표시]

(A)를 어법에 맞게 주어진 단어를 배열하시오.
[첫 번째 문장의 단어들을 무작위 순서로 나열, 마침표는 별도 표시]

(B)를 어법에 맞게 주어진 단어를 배열하시오.
[두 번째 문장의 단어들을 무작위 순서로 나열, 마침표는 별도 표시]

[정답]
(A) [올바른 어순의 완전한 문장]
(B) [올바른 어순의 완전한 문장]

## 예시:

**입력 지문:**
When writing a novel, research for information needs to be done. The thing is that some kinds of fiction demand a higher level of detail: crime fiction, for example, or scientific thrillers. The information is never hard to find; one website for authors even organizes trips to police stations, so that crime writers can get it right. Often, a polite letter will earn you permission to visit a particular location and record all the details that you need. But remember that [you will drive your readers to boredom if you think that you need to pack everything you discover into your work.] [The details that matter are those that reveal the human experience.] The crucial thing is telling a story, finding the characters, the tension, and the conflict—not the train timetable or the building blueprint.

**출력 결과:**
[서답형] 다음 글을 읽고, 물음에 답하시오.

When writing a novel, research for information needs to be done. The thing is that some kinds of fiction demand a higher level of detail: crime fiction, for example, or scientific thrillers. The information is never hard to find; one website for authors even organizes trips to police stations, so that crime writers can get it right. Often, a polite letter will earn you permission to visit a particular location and record all the details that you need. But remember that (A) [drive / will / work. / you / that / to / boredom / readers / your / think / if / discover / need / your / to / pack / you / you / into / you / everything] (B) [the / details / reveal / that / that / matter / are / those / experience. / the / human] The crucial thing is telling a story, finding the characters, the tension, and the conflict—not the train timetable or the building blueprint.

(A)를 어법에 맞게 주어진 단어를 배열하시오.
drive / will / work. / you / that / to / boredom / readers / your / think / if / discover / need / your / to / pack / you / you / into / you / everything

(B)를 어법에 맞게 주어진 단어를 배열하시오.
the / details / reveal / that / that / matter / are / those / experience. / the / human

[정답]
(A) you will drive your readers to boredom if you think that you need to pack everything you discover into your work.
(B) The details that matter are those that reveal the human experience.

---

**지문:**
${text}`;