export const getInferencePrompt = (text: string): string => {
  return `Given the following text, generate an inference question that tests the reader's ability to draw logical conclusions from the information provided. Include 5 options (①-⑤) where one option represents the most logical inference based on the text.

Text:
${text}

Please format your response as follows:
[Question]
[5 Options marked with ①-⑤]
[Answer]
[Explanation]`;
};