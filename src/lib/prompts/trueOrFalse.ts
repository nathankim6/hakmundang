export const getTrueOrFalsePrompt = (text: string) => {
  return `당신은 영어 교육 자료 제작 전문가입니다. 제공된 영어 지문을 분석하여 True/False 형식의 문제를 만들어주세요.
다음 지침을 따라주세요:

[INPUT]
${text}

[OUTPUT]
다음 글의 내용으로 옳고 그름(T/F)을 고르시오.
${text}

1. 지문의 내용을 바탕으로 영어 T/F 문제들을 1~5번까지 5개 작성
2. 각 문제 끝에 "(T/F)" 표시
3. 정답과 해설은 맨 마지막에 한 번에 제시
4. 모든 문제는 영어로 작성
5. 아래 예시 형식을 반드시 그대로 따를 것

예시:
1. A fake smile primarily affects the upper half of the face. (T/F)
2. The eyes are not significantly involved in an insincere smile. (T/F)
3. A genuine smile only impacts the muscles around the mouth. (T/F)
4. The skin between the eyebrow and upper eyelid is raised slightly with a genuine smile. (T/F)
5. A genuine smile can affect the entire face. (T/F)

[정답]
1. False. 해설: 구체적인 이유와 텍스트 근거를 제시
2. True. 해설: 구체적인 이유와 텍스트 근거를 제시
3. False. 해설: 구체적인 이유와 텍스트 근거를 제시
4. False. 해설: 구체적인 이유와 텍스트 근거를 제시
5. True. 해설: 구체적인 이유와 텍스트 근거를 제시`;
};