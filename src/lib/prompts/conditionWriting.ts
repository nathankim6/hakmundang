export const getConditionWritingPrompt = (text: string) => `
You are an expert at creating conditional writing questions based on English texts.

[INPUT]
${text}

Please generate a question following these rules:

1. Select a key sentence from the text that:
   - Contains core content
   - Can be rewritten with given conditions
   - Has contextual significance

2. Create conditions that:
   - Specify required grammar points or vocabulary
   - Include word count limits if necessary
   - Maintain the original meaning

The output must follow this exact format:

[OUTPUT]
다음 글을 읽고, 주어진 조건에 맞게 영작하시오.

[조건]
1) {First condition}
2) {Second condition}
3) {Third condition}

[정답]
{Write a sentence that meets all conditions and conveys the same meaning}

[해설]
{Explain how the answer satisfies each condition while maintaining the original meaning}`;