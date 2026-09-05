
export const getConjunctionPrompt = (text: string) => `
Generate a conjunction question based on the following text:
${text}

Follow this format strictly:
다음 글의 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?

[Text with (A) and (B) blanks]

① (A) ...... (B) 
② (A) ...... (B) 
③ (A) ...... (B) 
④ (A) ...... (B) 
⑤ (A) ...... (B) 

[정답] (Correct answer number)

[해설]
(A): (Explanation for A)
(B): (Explanation for B)

Use common conjunctions like:
- However, Nevertheless, Therefore
- In fact, Indeed, For example
- Moreover, Furthermore, In addition
- As a result, Consequently
- On the other hand, In contrast

Create challenging but clear questions that test understanding of logical connections between sentences.
`;
