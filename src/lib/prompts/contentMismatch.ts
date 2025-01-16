export const getContentMismatchPrompt = (text: string): string => {
  return `Please create a content mismatch question based on the following passage, following these specific guidelines:

Input: ${text}

[Format Requirements]
1. Question stem must be: "다음의 내용과 일치하지 않는 것을 고르시오."
2. Include the original passage
3. Provide five answer choices (①~⑤)
4. Identify the correct answer
5. Provide a detailed explanation including:
   - Evidence from the text that makes the answer incorrect
   - Brief explanation of why other options are consistent with the text
6. Include English-Korean translations for all answer choices

[Guidelines for Answer Choices]
1. All incorrect options must be clearly supported by the text
2. The correct answer should directly contradict the text
3. Maintain similar length and complexity across options
4. Base all options on explicitly stated or directly inferable information
5. Avoid absolute terms unless specifically supported by the text

Please format the output exactly as follows:

다음의 내용과 일치하지 않는 것을 고르시오.

${text}

①
②
③
④
⑤

[정답]
(번호)

[해설]
(정답 설명 및 근거 제시)

[보기 해석]
① (영문 보기 1의 한글 번역)
② (영문 보기 2의 한글 번역)
③ (영문 보기 3의 한글 번역)
④ (영문 보기 4의 한글 번역)
⑤ (영문 보기 5의 한글 번역)`;
};