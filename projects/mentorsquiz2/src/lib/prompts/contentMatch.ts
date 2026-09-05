export const getContentMatchPrompt = (text: string) => `[Input Format]
Please provide a passage of text that you would like to create a question from.

[Output Format]
Structure
1. Question stem: "다음의 내용과 일치하는 것을 고르시오."
2. Original passage
3. Five answer choices in English (①~⑤)
4. Correct answer
5. Explanation including:
   - The key evidence from the text that makes the answer correct
   - Brief explanation of why other options are inconsistent with the text

[Guidelines for Creating Options]
1. All incorrect options (distractors) must be contrasted or unrelated by the text but should be appealing.
2. The correct answer (the one that matches) should directly use clear, unambiguous language.
3. Maintain similar length and complexity across all options.
4. Base all options on information explicitly stated in or directly inferable from the text.
5. Avoid using absolute terms (always, never, all, none) unless specifically supported by the text.
6. Write all answer choices in English.

[Format Template]
다음의 내용과 일치하는 것을 고르시오.

${text}

① (English answer choice 1)
② (English answer choice 2)
③ (English answer choice 3)
④ (English answer choice 4)
⑤ (English answer choice 5)

[정답] 

[해설]

[OUTPUT]`;