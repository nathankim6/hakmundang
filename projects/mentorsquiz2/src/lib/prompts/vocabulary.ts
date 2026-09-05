
export const getVocabularyPrompt = (text: string) => {
  // Check for user-selected words (marked with square brackets)
  const selectedWords: string[] = [];
  let processedText = text;
  
  // Extract all words marked with square brackets
  const regex = /\[(.*?)\]/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      selectedWords.push(match[1].trim());
    }
  }
  
  // Remove the brackets from the text
  processedText = text.replace(/\[(.*?)\]/g, '$1');

  const basePrompt = `당신은 영어 지문에서 문맥상 적절하지 않은 어휘를 찾는 문제를 만드는 수능영어 전문가입니다. [INPUT]지문을 입력하면 다음 규칙에 따라 문제를 바로 만들어주세요:

문제 생성 프로세스 및 예시:
${selectedWords.length === 5 
  ? '사용자가 선택한 다음 5개의 단어를 보기로 사용하세요:\n' + selectedWords.join(', ')
  : '주어진 영어 지문에서 다음 기준으로 핵심 키워드 5개를 선정:\n- 지문의 주요 맥락을 가르는 중요 단어\n- 문맥상 유의어/반의어로 바꿀 수 있는 단어\n- 명사, 형용사, 동사, 부사 등 다양한 품사 포함\n- **중요**: 지문 전체에 앞에서부터 순서대로 고르게 분포되어 선정 (지문의 앞부분, 중간부분, 뒷부분에서 골고루 선택)'}

선정된 각 키워드에 대해:
①번부터 ⑤번까지 순서대로 번호 매기기 (**반드시 지문의 앞에서부터 순서대로 분포**)
원래 단어를 기호로 감싸서 리터럴 텍스트로 제시하기 (예시: ③**disturbed**）
5개중 4개는 비슷한 의미의 동의어로 대체하고, 1개는 원래 단어의 반의어로 바꾸기

문제 형식 예시:
다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?
Studies in psychology have reported cases in which competitive incentives resulted in lower task effort, and their focus was on the psychological underpinnings of the reduction in motivation. For example, competition presents an inevitable conflict between the motivation to achieve one's personal goal and the ①**aspiration** to maintain good relationships with others. When the maintenance of interpersonal relationships is important, with their counterparts in particular or with others generally, competitors experience an ②**intrinsic** conflict that can harm their desire to achieve their goal and taint the good feeling brought about by winning. Exline and Lobel found that the perception of oneself as a target for upward social comparison often makes people ③**disturbed** When they believe that others are making envious comparisons with them, people feel uneasiness, distress, or sorrow. Feelings of guilt, an emotion generally associated with high motivation for goal-achievement, lead to ④**stronger** motivation and performance in the pursuit of competitive goals. Consequences of this emotional state include lower task motivation in a competition and preferences for more cooperative and altruistic outcomes, such as ⑤**diminishing** the significance of the outcome or sharing the winner's reward.

[정답] ④
[해설] 경쟁 상황에서 사람들은 다른 사람과의 관계를 유지하려는 욕구와 목표를 달성하려는 동기 사이에서 심리적 갈등을 겪으며, 그 과정에서 느끼는 죄책감의 결과로 과업 동기가 감소하거나 더 협력적이고 이타주의적인 결과를 선호하게 된다는 내용의 글이다. 따라서 ④의 stronger를 weaker와 같은 낱말로 바꿔야 한다.
desire → aspiration (①): "욕구"라는 뜻의 유의어로 적절
internal → intrinsic (②): "내적인"이라는 뜻의 유의어로 적절
uncomfortable → disturbed (③): "불편한"이라는 뜻의 유의어로 적절
stronger → stronger (④): 반의어 weaker로 바꿔야 함
diminishing → diminishing (⑤): "감소하는 것"이라는 뜻의 유의어로 적절

새로운 지문이 입력되면:
${selectedWords.length === 5 
  ? '사용자가 선택한 5개의 단어를 보기로 사용하여 문제를 생성합니다.'
  : '지문을 분석하여 핵심 키워드 5개를 선정하고 문제를 생성합니다.'}
4개는 문맥에 맞는 유의어로, 1개는 문맥에 맞지 않는 반의어로 바꾸기
예시와 동일한 형식으로 문제 생성
반의어로 만들어진 정답 보기는 1개만 만들 것
생성된 문제만 출력

[INPUT]
${processedText}`;

  return basePrompt;
};
