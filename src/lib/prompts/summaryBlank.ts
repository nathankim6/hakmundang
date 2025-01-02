export const getSummaryBlankPrompt = (text: string) => `
You are an expert at creating summary completion questions based on English texts.

[INPUT]
${text}

Please generate a question following these rules:

1. Create a summary sentence that:
   - Captures the main idea of the text
   - Contains 3 blank spaces
   - Flows naturally

2. Each blank should:
   - Test understanding of key concepts
   - Be 2-3 words long
   - Be findable in the original text

The output must follow this exact format:

[OUTPUT]
다음 글의 내용을 요약하여 빈칸을 완성하시오.

[요약문]
(A) ______ ______ 와/과 (B) ______ ______ ______ 는/은 (C) ______ ______ ______ 하다.

[정답]
(A) [2-3단어]
(B) [2-3단어]
(C) [2-3단어]

[해설]
(A) [빈칸에 들어갈 표현이 정답인 이유와 본문에서의 맥락 설명]
(B) [빈칸에 들어갈 표현이 정답인 이유와 본문에서의 맥락 설명]
(C) [빈칸에 들어갈 표현이 정답인 이유와 본문에서의 맥락 설명]`;