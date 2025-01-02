export const getSungnamVocab2Prompt = (text: string) => `You are an expert at creating English-Korean translation questions.

Given the following list of English sentences and their Korean translations:
${text}

Please create a question following this format:

다음 우리말과 뜻이 같도록 영작했을 때, 틀린 문장은?

Select 5 random sentence pairs from the provided list and format them as follows:
① [Korean translation 1]
[English sentence 1]
② [Korean translation 2]
[English sentence 2]
③ [Korean translation 3]
[English sentence 3]
④ [Korean translation 4]
[English sentence 4]
⑤ [Korean translation 5]
[English sentence 5]

Important:
1. Do not create any errors or modifications in the sentences
2. Use the exact sentences from the provided list
3. Present them in their original form
4. The errors will be manually added later`;