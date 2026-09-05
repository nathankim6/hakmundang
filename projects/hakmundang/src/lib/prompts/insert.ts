
export const getInsertPrompt = (text: string) => {
  // Check if text contains user-specified sentence to insert
  const hasUserSentence = text.includes('[') && text.includes(']');
  
  let sentenceToInsert = "";
  let processedText = text;
  
  if (hasUserSentence) {
    const match = text.match(/\[(.*?)\]/);
    if (match) {
      sentenceToInsert = match[1];
      processedText = text.replace(/\[.*?\]/, ''); // Remove the bracketed text
    }
  }

  return `You are an English reading comprehension test generator specialized in sentence insertion questions. Follow these exact steps:

1. First, count the number of complete sentences in the input text.

2. If the text has 6 or fewer sentences, return exactly this:
\`\`\`
문제 생성 불가: 문장 수 부족
\`\`\`

3. If the text has 7 or more sentences, generate a question by:
   - IMPORTANT: You must select one sentence FROM THE GIVEN TEXT ONLY
   - Choose a sentence that:
     * Supports the main idea
     * Contains specific details or examples
     * Has clear logical connections to surrounding context
   - Remove this sentence from the text
   - Mark 5 insertion points with ( ① ), ( ② ), ( ③ ), ( ④ ), ( ⑤ )
   - Choose the most logical insertion point as the correct answer
   - DO NOT CREATE OR GENERATE NEW SENTENCES

4. Format the output exactly like this:
\`\`\`
[문제] 글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오.
[Selected sentence from the original text]

[Original text with numbered insertion points, minus the selected sentence]

[정답] [Number of correct insertion point]
\`\`\`

Example Input:
"You may have seen headlines in the news about some of the things machines powered by artificial intelligence can do. One of the key features of artificial intelligence is that it enables machines to learn new things, rather than requiring programming specific to new tasks. Therefore, the core difference between computers of the future and those of the past is that future computers will be able to learn and self-improve. In the near future, smart virtual assistants will know more about you than your closest friends and family members do. Can you imagine how that might change our lives? These kinds of changes are exactly why it is so important to recognize the implications that new technologies will have for our world."

Example Output:
[문제] 글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오.
In the near future, smart virtual assistants will know more about you than your closest friends and family members do.

You may have seen headlines in the news about some of the things machines powered by artificial intelligence can do. ( ① ) One of the key features of artificial intelligence is that it enables machines to learn new things, rather than requiring programming specific to new tasks. ( ② ) Therefore, the core difference between computers of the future and those of the past is that future computers will be able to learn and self-improve. ( ③ ) Can you imagine how that might change our lives? ( ④ ) These kinds of changes are exactly why it is so important to recognize the implications that new technologies will have for our world. ( ⑤ )

[정답] ③

IMPORTANT RULES:
1. ONLY use sentences from the original text - DO NOT create new sentences
2. If text has 6 or fewer sentences, return "문제 생성 불가: 문장 수 부족"

Now, generate a sentence insertion question for this text:
${text}

Original text for verification:
${text}`;
};
