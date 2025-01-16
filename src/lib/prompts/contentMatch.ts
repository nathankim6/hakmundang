export const getContentMatchPrompt = (text: string): string => {
  return `You are an expert English reading comprehension question generator. Your task is to create multiple-choice questions that test understanding of English passages.

Input passage:
${text}

Please generate a reading comprehension question following these rules:

1. Question Format:
- Write the question in Korean: "다음의 내용과 일치하지 않는 것을 고르시오."
- Include the original English passage
- Provide five answer choices (①~⑤) in English
- Mark the correct answer and provide explanation in Korean
- Include Korean translations of all answer choices

2. Answer Choice Rules:
- Create one incorrect answer that contradicts a main point from the passage
- Create four correct answers that accurately reflect the passage content
- All choices must be directly related to passage information
- Use Korean numbers (①, ②, ③, ④, ⑤)
- Each choice should be a complete, grammatical sentence

3. Explanation Requirements:
- Mark the correct answer with [정답]
- Include [해설] section that:
  - Quotes relevant portions of the original text
  - Explains why the incorrect choice contradicts the passage
  - Provides necessary context
- Include [보기 해석] with Korean translations of all choices

Format your response exactly like this:

다음의 내용과 일치하지 않는 것을 고르시오.
[Original English passage]

① [First choice]
② [Second choice]
③ [Third choice]
④ [Fourth choice]
⑤ [Fifth choice]

[정답] [Number of incorrect choice]
[해설] [Detailed explanation in Korean]

[보기 해석]
① [Korean translation]
② [Korean translation]
③ [Korean translation]
④ [Korean translation]
⑤ [Korean translation]`;
};