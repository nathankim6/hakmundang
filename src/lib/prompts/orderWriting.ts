export const getOrderWritingPrompt = (text: string) => `
You are an expert at creating sentence arrangement questions based on English texts.

[INPUT]
${text}

Please generate a question following these rules:

1. Select a key sentence from the text that:
   - Contains core content
   - Can be completed independently
   - Has contextual significance
   - Is approximately 12 words long

2. Create a blank in the sentence by:
   - Identifying a complete phrase or clause that can be reconstructed from given words
   - Marking the blank with exactly 23 underscores (___)

3. Present words:
   - Use exactly 12 words from the original sentence
   - Present them in scrambled order, separated by /
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
1) 12단어로 빈칸을 완성하시오.
2) 다음 단어를 한 번씩 사용하여 배열하시오.
    [12 words from the original sentence, separated by /]

[정답]
[Original sentence that fits in the blank]`;