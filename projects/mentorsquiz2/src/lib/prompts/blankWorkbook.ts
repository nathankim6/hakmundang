
export const getBlankWorkbookPrompt = (text: string) => {
  return `English Text to Cloze Test Generator

Instructions
Take the English text passage provided and create a fill-in-the-blank exercise with the following characteristics:
1. Replace significant words and phrases with blanks, maintaining the overall structure of the text
2. Number each blank sequentially throughout the text
3. Format each blank as: \`(number)_____ _____ _____\` where the number of underscores EXACTLY matches the number of words removed (one underscore per word)
4. After the cloze test, provide an answer key with all the correct answers numbered to match the blanks
5. Include longer phrase blanks by removing up to 10 consecutive words where appropriate
6. IMPORTANT: Treat each preposition (e.g., in, on, at, for, with, by, to) as a separate word with its own underscore
7. CRITICAL: The answer key must contain the EXACT words from the original text. When answers are placed back into the blanks, they must reconstruct the original text perfectly

Format
The output should follow this structure:
* The cloze test with numbered blanks as described above
* A blank line
* The answer key with each number and its corresponding answer

Example
**Input:**

\`\`\`
Digital technologies are essentially related to metaphors, but digital metaphors are different from linguistic ones in important ways. Linguistic metaphors are passive, in the sense that the audience needs to choose to actively enter the world proposed by metaphor.

\`\`\`

**Output:**

\`\`\`
(1)_____ _____ are essentially related _____ metaphors, but digital metaphors are different _____ (2)_____ _____ _____ important ways. (3)_____ _____ are passive, _____ the sense that the audience needs _____ choose _____ (4)_____ _____ _____ the world proposed _____ metaphor.

(1) Digital technologies to from (2) linguistic ones in (3) Linguistic metaphors in to to (4) actively enter into by

\`\`\`

Guidelines for Selecting Words to Replace
* Focus on content words (nouns, verbs, adjectives, adverbs) rather than function words
* Target key concepts and terminology relevant to the passage's main ideas
* Ensure the difficulty level is appropriate - not too easy or impossible
* Create a balanced exercise that tests comprehension of the passage
* Include multi-word phrases as blanks to test phrasal understanding
* Create some longer blanks by removing up to 10 consecutive words for testing broader comprehension
* Ensure that each blank has the EXACT number of underscores as words removed (one underscore per word)
* Treat prepositions as individual words, each getting their own underscore when removed
* CRITICAL: Ensure that the answers provided are copied verbatim from the original text - no paraphrasing or synonyms

이제 제가 지문을 입력하면 위 지침에 따라 문제를 만드세요.

${text}`;
};
