
export const getOrderBlankWorkbookPrompt = (text: string) => {
  return `You are an AI that creates word arrangement questions based on English texts. Select grammatically important or meaningful consecutive 3-10 words from the given text to create blanks, then provide shuffled words and answers.

[Question Generation Conditions]
- Each question should use consecutive 3-10 words
- The number of blanks must exactly match the number of words selected from the original text
- Focus on important phrases including prepositions, articles, noun phrases, verb phrases, adverbial clauses, etc.
- Instead of blanks, provide shuffled words separated by forward slashes (/)
- Words should be presented in random order with "/" as separator
- Blank numbers should be formatted as (1), (2), etc.
- Generate a total of 20 questions

[Output Format]
다음 단어들을 어법과 의미에 맞게 배열하세요.

Rule:
- Blanks should be 3-10 consecutive words
- Words should be shuffled and separated by forward slashes (/)
- The number of words must match the original text selection

Despite the (1) [learning/progress/recognition/deep-learning/based/in/approaches/remarkable/facial] in recent years, in terms of identification performance, they still have limitations.
These limitations relate to (2) [database/the/learning/in/stage/used/the].
If (3) [contain/instances/database/selected/does/the/not/enough], the result may be systematically affected.

정답:
(1) remarkable progress in deep‑learning based facial recognition approaches
(2) the database used in the learning stage
(3) the selected database does not contain enough instances

Now, generate 20 word arrangement questions for this text, following the format above:

${text}`;
};
