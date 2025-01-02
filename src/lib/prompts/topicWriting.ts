export const getTopicWritingPrompt = (text: string) => `
You are an expert at creating topic sentence writing questions based on English texts.

[INPUT]
${text}

Please generate a question following these rules:

1. Create a topic sentence that:
   - Captures the main idea of the text
   - Uses clear and concise language
   - Can be written with given words

2. Provide words that:
   - Are essential for expressing the main idea
   - Include necessary grammar words
   - Can be arranged to form a complete sentence

The output must follow this exact format:

[OUTPUT]
다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.

[조건] 
1) 12단어로 빈칸을 완성하시오.
2) 다음 단어를 한 번씩 사용하여 배열하시오.

{List of 12 words separated by / that can form a topic sentence}

주제문: __________________________________________.

[정답]
{Write a 12-word topic sentence using all given words}

[해설]
{Explain how the topic sentence captures the main idea of the text and how the words were arranged}`;