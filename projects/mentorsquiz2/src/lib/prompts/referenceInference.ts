export const getReferenceInferencePrompt = (text: string) => `다음 지문을 읽고, 아래 예시와 동일한 형식의 문제를 만들어주세요.

**예시 문제:**
다음 밑줄 친 부분 중 의미하는 대상이 다른 하나는?  
Let's return to a time in which photographs were not in living color. During that period, people referred to pictures as "photographs" rather than ①**"black‑and‑white photographs"** as we do today. The possibility of color did not exist, so it was unnecessary to insert the adjective "black‑and‑white." However, suppose we did include the phrase "black‑and‑white" before the existence of color photography. By ②**highlighting that reality**, we become conscious of current limitations and thus open our minds to new possibilities and potential opportunities. World War I was given that name only after we were deeply embattled in World War II. Before that horrific period of the 1940s, World War I was simply called ③**"The Great War" or, even worse, "The War to End All Wars."** What if we had called it ④**"World War I"** back in 1918? Such a label might have made the possibility of a second worldwide conflict an greater reality for governments and individuals. We become conscious of ⑤**issues when we explicitly identify them.**

[정답] ③  
[해설] 나머지 보기들은 현실의 새로운 가능성을 만들어내는 것을 암시하거나 가리키지만 ③번은 새로운 가능성이 만들어지기 이전의 상태를 의미하므로 의미상 다릅니다.

**문제 요구사항:**
1. 지문에서 적절한 5개 부분에 밑줄을 그어 ①②③④⑤ 선택지로 만들기
2. 문제: "다음 밑줄 친 부분 중 의미하는 대상이 다른 하나는?"
3. 정답 번호는 ①~⑤ 중에서 랜덤으로 결정
4. 지문의 내용과 논리에 맞게 선택지들 사이의 의미적 관계 설정

**선택지 설계 원칙:**
- 4개 선택지: 지문의 맥락에서 같은 범주나 개념을 가리키는 표현들
- 1개 선택지: 나머지와 다른 범주나 개념을 가리키는 표현 (정답)

**출력 형식:**
- 지문에 ①②③④⑤ 번호와 함께 밑줄 부분을 "**" 기호로 앞뒤로 감싸서 표시 (예: ①**밑줄부분**)
- [정답] (해당 번호)
- [해설] 지문 내용에 맞는 논리적 설명

이제 아래 지문에 맞는 동일 유형 문제를 생성해주세요:

${text}`;