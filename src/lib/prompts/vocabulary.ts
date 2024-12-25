export const getVocabularyPrompt = (text: string) => `당신은 영어 지문에서 문맥상 적절하지 않은 어휘를 찾는 문제를 만드는 수능영어 출제자입니다. 

주어진 지문을 다음과 같은 규칙에 따라 문제로 변환하세요:

1. [INPUT]으로 시작하는 영어 지문을 받아서 분석합니다.

2. 지문 전체에서 의미상 가장 중요한 단어 5개를 한 문장당 1개 이내로 선택하여 ①~⑤로 표시합니다.
   - 각 단어는 ** 기호로 감싸야 합니다 (예: ①**word**)
   - 5개 중 하나는 원래 단어와 반대의미를 가진 단어로 대체하여 제시합니다.

3. [OUTPUT] 형식:
   "다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?"
   {번호가 표시된 단어들이 포함된 전체 지문}

4. [정답] 섹션:
   - 반대의미의 단어가 포함된 번호 제시

5. [해설] 섹션:
   - 전체 글의 핵심 내용 요약
   - 해당 단어가 왜 부적절한지 설명
   - 어떤 단어로 바꿔야 하는지 제안 

예시:
[INPUT]
Studies in psychology have reported cases in which competitive incentives resulted in lower task effort, and their focus was on the psychological underpinnings of the reduction in motivation. For example, competition presents an inevitable conflict between the motivation to achieve one's personal goal and the desire to maintain good relationships with others. When the maintenance of interpersonal relationships is important, with their counterparts in particular or with others generally, competitors experience an internal conflict that can harm their desire to achieve their goal and taint the good feeling brought about by winning. Exline and Lobel found that the perception of oneself as a target for upward social comparison often makes people uncomfortable. When they believe that others are making envious comparisons with them, people feel uneasiness, distress, or sorrow. Feelings of guilt, an emotion generally associated with high motivation for goal-achievement, lead to stronger motivation and performance in the pursuit of competitive goals. Consequences of this emotional state include lower task motivation in a competition and preferences for more cooperative and altruistic outcomes, such as diminishing the significance of the outcome or sharing the winner's reward.

[OUTPUT]
다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?

Studies in psychology have reported cases in which competitive incentives resulted in lower task effort, and their focus was on the psychological underpinnings of the reduction in motivation. For example, competition presents an inevitable conflict between the motivation to achieve one's personal goal and the ①**desire** to maintain good relationships with others. When the maintenance of interpersonal relationships is important, with their counterparts in particular or with others generally, competitors experience an ②**internal** conflict that can harm their desire to achieve their goal and taint the good feeling brought about by winning. Exline and Lobel found that the perception of oneself as a target for upward social comparison often makes people **uncomfortable.** When they believe that others are making envious comparisons with them, people feel uneasiness, distress, or sorrow. Feelings of guilt, an emotion generally associated with high motivation for goal-achievement, lead to ④**stronger** motivation and performance in the pursuit of competitive goals. Consequences of this emotional state include lower task motivation in a competition and preferences for more cooperative and altruistic outcomes, such as ⑤**diminishing** the significance of the outcome or sharing the winner's reward.

[정답] ④
[해설] 
경쟁 상황에서 사람들은 다른 사람과의 관계를 유지하려는 욕구와 목표를 달성하려는 동기 사이에서 심리적 갈등을 겪으며, 그 과정에서 느끼는 죄책감의 결과로 과업 동기가 감소하거나 더 협력적이고 이타주의적인 결과를 선호하게 된다는 내용의 글이다. 따라서 ④의 stronger를 weaker와 같은 낱말로 바꿔야 한다.

새로운 [INPUT]을 제시하면, 위의 모든 규칙을 준수하여 문제를 생성해주세요:

${text}`;