export const getVocabularyPrompt = (text: string) => `[INPUT]에 제시된 영어 지문을 읽고, 문맥상 낱말의 쓰임이 적절하지 않은 것을 찾아내는 문제를 만들어주세요.

문제 형식:
- 문제 유형: "다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?"
- 지문은 원문 영어 텍스트를 그대로 사용하되, 5개의 단어를 선택하여 밑줄 치고 번호를 매김
- 선택지는 밑줄 친 단어에 번호를 매겨 ①~⑤로 표시

출제 시 주의사항:
- 정답이 되는 단어는 문맥상 반대되는 의미나 더 적절한 단어로 바꿔야 하는 것을 선택
- 오답이 되는 단어들은 문맥상 적절하게 사용된 것을 선택
- 단어 선택 시 품사가 바뀌지 않도록 주의
- 지문의 핵심 내용과 관련된 중요한 단어들을 선택
- 너무 쉽거나 어려운 단어는 피하고 적절한 난이도 유지

예시:
[INPUT]
Studies in psychology have reported cases in which competitive incentives resulted in lower task effort, and their focus was on the psychological underpinnings of the reduction in motivation. For example, competition presents an inevitable conflict between the motivation to achieve one's personal goal and the desire to maintain good relationships with others. When the maintenance of interpersonal relationships is important, with their counterparts in particular or with others generally, competitors experience an internal conflict that can harm their desire to achieve their goal and taint the good feeling brought about by winning. Exline and Lobel found that the perception of oneself as a target for upward social comparison often makes people uncomfortable. When they believe that others are making envious comparisons with them, people feel uneasiness, distress, or sorrow. Feelings of guilt, an emotion generally associated with high motivation for goal-achievement, lead to stronger motivation and performance in the pursuit of competitive goals. Consequences of this emotional state include lower task motivation in a competition and preferences for more cooperative and altruistic outcomes, such as diminishing the significance of the outcome or sharing the winner's reward.

[OUTPUT]
다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?

Studies in psychology have reported cases in which competitive incentives resulted in lower task effort, and their focus was on the psychological underpinnings of the reduction in motivation. For example, competition presents an inevitable conflict between the motivation to achieve one's personal goal and the ①desire to maintain good relationships with others. When the maintenance of interpersonal relationships is important, with their counterparts in particular or with others generally, competitors experience an ②internal conflict that can harm their desire to achieve their goal and taint the good feeling brought about by winning. Exline and Lobel found that the perception of oneself as a target for upward social comparison often makes people ③uncomfortable. When they believe that others are making envious comparisons with them, people feel uneasiness, distress, or sorrow. Feelings of guilt, an emotion generally associated with high motivation for goal-achievement, lead to ④stronger motivation and performance in the pursuit of competitive goals. Consequences of this emotional state include lower task motivation in a competition and preferences for more cooperative and altruistic outcomes, such as ⑤diminishing the significance of the outcome or sharing the winner's reward.

[정답] ④
[해설] 경쟁 상황에서 사람들은 다른 사람과의 관계를 유지하려는 욕구와 목표를 달성하려는 동기 사이에서 심리적 갈등을 겪으며, 그 과정에서 느끼는 죄책감의 결과로 과업 동기가 감소하거나 더 협력적이고 이타주의적인 결과를 선호하게 된다는 내용의 글이다. 따라서 ④의 stronger를 weaker와 같은 낱말로 바꿔야 한다.

위의 예시와 같은 형식으로 다음 지문에 대한 어휘 문제를 생성해주세요:

${text}`;