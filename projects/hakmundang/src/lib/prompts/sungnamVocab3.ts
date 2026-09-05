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
4. Sentences should clearly demonstrate the word's meaning

Answer format:
[정답] (number)
[해설] Explain why the definition is incorrect by:
- Providing the actual meaning of the word
- Identifying which word's definition was incorrectly used

Example:
다음 밑줄 친 단어의 영영사전 뜻풀이로 적절하지 않은 것은?
① The Atitlan Giant Grebe was a large, flightless bird that had **evolved** from the much widespread and smaller Pied-billed Grebe.
[evolve = to go in a circle around a central point]
② She had **conceived** the idea of a series of novels.
[conceive = to form an idea or plan in your mind]
③ The young must **locate**, identify, and settle in a habitat that satisfies not only survivorship but reproductive needs as well.
[locate = to find the exact position of somebody/something]
④ Amnesia most often results from a brain injury that leaves the victim unable to form new memories, but with memories of the past **intact**.
[intact = complete and not damaged or changed in any way]
⑤ A resentment has **arisen** from his carelessness.
[arise = to begin to exist or develop]

[정답] ①
[해설] evolve는 "진화하다"라는 의미의 단어이며, "to go in a circle around a central point"는 "revolve(공전하다)"의 영영사전 정의이다.

Please create a question following this exact format and rules using the provided example sentences.`;