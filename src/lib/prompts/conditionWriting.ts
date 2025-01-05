export const getConditionWritingPrompt = (text: string) => `[INPUT]
${text}

[OUTPUT]
다음 글을 읽고, 물음에 답하시오.

${text}

[문제]
다음 글의 빈칸에 들어갈 이 글의 주제문을 주어진 단어 만을 활용하여 완성하시오.
(단, 단어의 형태는 변형하지 마시오.)

[우리말]
{Write a Korean translation of the answer sentence}

[단어]
{Take all words from the answer sentence and scramble them, separated by /}

[정답]
{Write ONE grammatically correct English sentence that matches the Korean translation}`;