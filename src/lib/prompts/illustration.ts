export const getIllustrationPrompt = (text: string): string => {
  return `Given the following text, generate an illustration question that tests the reader's understanding of the passage through visual representation. Include 5 options (①-⑤) where one option correctly matches the content of the text.

Text:
${text}

Please format your response as follows:
[Question]
[5 Options marked with ①-⑤]
[Answer]
[Explanation]`;
};