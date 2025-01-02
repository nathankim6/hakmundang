export const getSungnamVocab1Prompt = (text: string) => `You are an expert at creating vocabulary questions that test students' understanding of synonyms and antonyms.

Given the following word list:
${text}

Please generate a question following these rules:

1. Find all synonym and antonym pairs from the provided word list. Each word in the pairs must be from the provided list.

2. Write "두 단어의 관계가 다음과 같은 것은 몇 개인가?"

3. Randomly select one pair from step 1 and present it as "<보기> word1 - word2"

4. Skip a line and present 7 random word pairs from the list (excluding the example pair)

5. Append the explanation in this format:
[정답] [Total count]개 (List all synonym/antonym pairs excluding the example)
[해설] [보기]의 단어 관계는 [explanation of the relationship]
[동의어] [word1] - [word2] ([meaning of word1] - [meaning of word2])
[반의어] [word1] - [word2] ([meaning of word1] - [meaning of word2])

The output must follow this exact format:

두 단어의 관계가 다음과 같은 것은 몇 개인가?
<보기> [word1] - [word2]

[7 random word pairs, one per line]

[정답] [count]개 ([pairs])
[해설] [보기]의 단어 관계는 [explanation]

[동의어]
[synonym pairs with meanings]

[반의어]
[antonym pairs with meanings]`;