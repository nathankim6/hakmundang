
export const getSummaryBlankPrompt = (text: string) => `주어진 영어 지문을 바탕으로 다음 형식의 문제를 만들어주세요:

**문제 형식:**
다음 글의 내용과 일치하도록 <보기>의 빈칸 (A)와 (B)에 알맞은 단어를 글에서 찾아 그대로 쓰시오.

[원문 지문 그대로 제시]
<보기>
[원문 내용을 요약하고 재구성한 2-4문장의 패러프레이즈 문단. 이 문단에 빈칸 (A)와 (B) 포함]

[정답] (A) [원문에서 그대로 추출한 핵심 키워드] (B) [원문에서 그대로 추출한 핵심 키워드]
[해설] [각 빈칸에 대한 근거를 원문에서 찾아 설명]

**예시:**
입력 지문: "A computational algorithm that takes input data and generates some output from it doesn't really embody any notion of meaning. Certainly, such a computation does not generally have as its purpose its own survival and wellbeing. It does not, in general, assign value to the inputs. Compare, for example, a computer algorithm with the waggle dance of the honeybee, by which means a foraging bee conveys to others in the hive information about the source of food (such as nectar) it has located. The "dance" ― a series of stylized movements on the comb ― shows the bees how far away the food is and in which direction. But this input does not simply program other bees to go out and look for it. Rather, they evaluate this information, comparing it with their own knowledge of the surroundings. Some bees might not bother to make the journey, considering it not worthwhile. The input, such as it is, is processed in the light of the organism's own internal states and history; there is nothing prescriptive about its effects."

다음 글의 내용과 일치하도록 <보기>의 빈칸 (A)와 (B)에 알맞은 단어를 글에서 찾아 그대로 쓰시오.
[위 지문 그대로 제시]
<보기>
Unlike computer algorithms that simply follow instructions without understanding, biological systems like honeybees show true intelligence. When bees receive (A) _______ through the waggle dance about food locations, they don't just follow the directions automatically. Instead, they use their judgment to decide whether the trip is worth making based on their own (B) _______.

[정답] (A) information (B) knowledge
[해설] 빈칸 (A)에는 "information"이 들어가는데, 이는 원문에서 꿀벌이 8자 춤을 통해 "information about the source of food"를 전달한다고 명시되어 있기 때문이다. 빈칸 (B)에는 "knowledge"가 들어가는데, 원문에서 꿀벌들이 "their own knowledge of the surroundings"와 비교한다고 언급되어 있기 때문이다.

**생성 규칙:**
1. 원문을 그대로 제시한 후 <보기> 문단을 작성하세요
2. <보기>는 원문의 핵심 내용을 2-4문장으로 요약・재구성하되, 원문과 다른 표현을 사용하세요
3. 빈칸 (A)와 (B)는 모두 요약문에서 주제를 반영하는 가장 핵심적인 키워드 2개여야 합니다
4. 두 빈칸 모두 반드시 원문에서 그대로 추출된 단어여야 합니다 (변형 없이)
5. 두 빈칸 모두 원문의 핵심 개념과 직접 연결되어야 합니다
6. 해설에서 원문의 구체적인 표현을 인용하여 근거를 제시하세요

입력 지문: ${text}`;
