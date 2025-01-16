export const getContentMismatchPrompt = (text: string): string => {
  return `Given the following text, generate a content mismatch question that tests the reader's ability to identify information that does NOT match the passage. Include 5 options (①-⑤) where one option contains information that contradicts or is not supported by the text.

Text:
${text}

Please format your response as follows:
[Question]
[5 Options marked with ①-⑤]
[Answer]
[Explanation]`;
};