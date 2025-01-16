export const getContentMatchPrompt = (text: string): string => {
  return `Given the following text, generate a content matching question that tests the reader's comprehension of explicit details in the passage. Include 5 options (①-⑤) where one option correctly matches the content of the text.

Text:
${text}

Please format your response as follows:
[Question]
[5 Options marked with ①-⑤]
[Answer]
[Explanation]`;
};