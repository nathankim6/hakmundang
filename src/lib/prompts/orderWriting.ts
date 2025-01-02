export const getOrderWritingPrompt = (text: string) => `
You are an expert at creating sentence arrangement questions based on English texts.

[INPUT]
${text}

Please generate a question following these rules:

1. Select a key sentence from the text that:
   - Contains core content
   - Can be completed independently
   - Has contextual significance

2. Present words:
   - Use words exactly as they appear in the original sentence
   - Present them in order of appearance
   - No modifications to parts of speech or form

3. Answer:
   - Use the original sentence exactly
   - Use each given word exactly once
   - Maintain the original meaning

The output must follow this exact format:

[OUTPUT]
다음 글을 읽고, 주어진 단어들을 바르게 배열하여 문장을 완성하시오.

[단어]
{Take all words from the answer sentence and scramble them, separated by /}

[정답]
{Write the original sentence from the text}

[해설]
{Explain how the words were arranged to form a grammatically correct sentence that captures the main idea of the text}`;