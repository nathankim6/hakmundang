export const getOrderWritingAdvancedPrompt = (text: string) => `
You are an expert at creating sentence completion questions based on English texts.

[INPUT]
${text}

Please generate a question following these rules:

1. Select a key sentence from the text that:
   - Contains core content
   - Can be completed independently
   - Has contextual significance

2. Mark the blank with exactly 23 underscores (_) with spaces before and after

3. Present words:
   - Use words exactly as they appear in the original sentence
   - Present them in order of appearance
   - No modifications to parts of speech or form

4. Answer:
   - Use the original sentence exactly
   - Use each given word exactly once
   - Maintain the original meaning

The output must follow this exact format:

[OUTPUT]
다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.

[Selected text with blank marked by 23 underscores]

[조건]
1) [N]단어로 빈칸을 완성하시오.
2) 다음 단어를 한 번씩 사용하여 배열하시오.
    [Words from the original sentence in order of appearance]

[정답]
[Original sentence]
`;