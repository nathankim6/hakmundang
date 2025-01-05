export const getOrderWritingPrompt = (text: string) => `[INPUT]
${text}

[OUTPUT]
[서답형] 다음 글을 읽고, 물음에 답하시오.

${text}

(A)를 어법에 맞게 주어진 단어를 배열하시오.
{List all words from the jumbled sentence, separated by / }

[정답]
{Write the correct sentence arrangement for the section}`;