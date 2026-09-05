

export const getSummaryPrompt = (text: string) => `Instructions
Generate a reading comprehension question based on the given English passage in the following format.

Question Generation Rules
1. Question Type
- Summary completion: Create a summary sentence that captures the core content of the passage with two blanks (A), (B)
- The blanks should contain key concepts or phrases that represent the essence of the passage

2. Question Components
- Question instruction: "다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?"
- Original text: Present the given passage as is
- Summary sentence: A natural summary sentence of the entire passage content (including 2 blanks)
- Options: 5 choices (①~⑤)
- Answer indication: "Answer" label
- Explanation: Detailed commentary

3. Summary Sentence Criteria
- Naturally summarize the entire content of the passage in one sentence
- Must comprehensively include the topic, key arguments, and conclusions of the text
- Blank (A) should be a key word that represents the main theme/topic of the passage
- Blank (B) should be a key word that represents the main point/argument of the passage
- Add "_______" after each (A) and (B) in the summary sentence
- Summary sentence must accurately reflect the logical flow and core message of the original text
- Construct with natural sentence structure

4. Option Creation Criteria
- 1 correct answer + 4 incorrect answers
- Each option should be in "(A) + (B)" format
- Incorrect answers should be plausible but logically inconsistent with the passage
- Vocabulary difficulty should be appropriate for high school level
- All options must be in English

5. Explanation Criteria
- Briefly summarize the core content of the passage
- Logically explain why the answer is correct
- Include brief explanations for each incorrect option
- Write in clear and understandable Korean

Output Format:
다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?

${text}

[Create a natural English summary sentence of the passage content including blanks (A)_______ and (B)_______]

     (A)          (B)
① [English word1]…… [English verb1]
② [English word2]…… [English verb2]
③ [English word3]…… [English verb3]
④ [English word4]…… [English verb4]
⑤ [English word5]…… [English verb5]

[정답]
[Answer number]
[해설]
[Summary of passage core content]. Therefore, the most appropriate words for blanks (A) and (B) in the summary are [answer number] '[answer explanation]'.
② [Explanation for option 2] ③ [Explanation for option 3] ④ [Explanation for option 4] ⑤ [Explanation for option 5]`;

