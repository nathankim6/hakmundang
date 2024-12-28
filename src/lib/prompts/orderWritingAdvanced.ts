export const getOrderWritingAdvancedPrompt = (text: string) => `Create English sentence arrangement questions following this format:

[INPUT]
${text}

[OUTPUT]
[서답형] 다음 글을 읽고, 물음에 답하시오.

${text}

[문제]
주어진 단어들을 바르게 배열하여 우리말과 같은 의미가 되도록 영작하시오.
(단, 단어의 형태를 필요에 따라 적절히 변형하시오.)

[우리말]
{Write a Korean sentence that captures a key idea from the text}

[단어]
{List 6-8 key words from the passage in their base form, separated by / }

[정답]
{Write ONE grammatically correct English sentence that matches the Korean meaning, using ALL given words with appropriate form changes}

[해설]
1. 주어진 단어의 형태 변화:
{List each word that was changed and explain why - e.g., verb tense, plural form, etc.}

2. 문장 구조 설명:
{Explain the sentence structure and how it matches the Korean meaning}`;