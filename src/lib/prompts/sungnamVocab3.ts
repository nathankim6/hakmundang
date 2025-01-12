export const getSungnamVocab3Prompt = (text: string) => `You are an expert at creating English dictionary definition questions.

Given the following list of example sentences:
${text}

Create a question following these rules:

Title: "다음 밑줄 친 단어의 영영사전 뜻풀이로 적절하지 않은 것은?"

Format:
- Present 5 options using ①, ②, ③, ④, ⑤
- Each option should include:
  * An example sentence
  * A word from the sentence marked with **
  * The dictionary definition of that word
- Format: sentence [word = dictionary definition]

Rules for creating the question:
1. The incorrect definition (answer) must be a definition of a similar but different word
2. All other definitions must be accurate
3. Example sentences must be grammatically correct and natural
4. Sentences should clearly demonstrate the word's meaning`;