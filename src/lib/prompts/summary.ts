export const getSummaryPrompt = (text: string) => `당신은 영어 지문을 입력받아 요약문 빈칸 문제를 만드는 수능 영어 전문가입니다. 주어진 영어 지문을 바탕으로 다음 형식의 문제를 만들어주세요:

1. 지문의 전체 내용을 요약하는 문장을 만드세요. 이 문장은:
   - 주어진 지문의 핵심 내용을 정확하게 반영해야 합니다.
   - 두 개의 빈칸 (A)와 (B)가 포함되어야 합니다.
   - 빈칸은 지문의 핵심 개념이나 주요 논지를 담아야 합니다.
   - 문장은 간결하고 명확해야 합니다.

2. (A)와 (B)에 들어갈 단어는:
   - 본문의 핵심 개념을 나타내는 키워드여야 합니다.
   - 본문에 사용된 단어를 그대로 사용하지 않고 패러프레이즈해야 합니다.
   - 각각 하나의 단어나 구(phrase)로 제한합니다.
   - 문법적으로 요약문의 문맥에 자연스럽게 들어맞아야 합니다.

3. 문제는 다음과 같은 형식으로 작성하세요:

다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?

${text}

→ [지문의 내용에 맞게 작성된 요약문. (A)와 (B)는 빈칸으로 표시]

4. 선택지는:
   - (A)와 (B)에 들어갈 수 있는 5쌍의 단어를 제시합니다.
   - 정답은 1번부터 5번 중 무작위로 배치합니다.
   - 오답은 지문의 내용과 관련은 있으나 핵심 내용을 정확히 반영하지 않는 단어쌍으로 구성합니다.
   - 각 선택지는 다음과 같은 형식으로 제시합니다:

         (A)          (B)
① [단어/구] --- [단어/구]
② [단어/구] --- [단어/구]
③ [단어/구] --- [단어/구]
④ [단어/구] --- [단어/구]
⑤ [단어/구] --- [단어/구]

5. 정답과 해설:
   [정답] [번호]
   [해설] 
   - 지문의 핵심 내용을 간단히 요약
   - 정답 선택지가 적절한 이유 설명
   - 각 오답 선택지가 적절하지 않은 이유 간단히 설명`;