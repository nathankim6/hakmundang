export const getTopicWritingPrompt = (text: string) => `[INPUT]
${text}

[OUTPUT]
다음 글을 읽고, 물음에 답하시오.

${text}

[문제]
다음 글의 주제문을 우리말로 주어진 단어들을 순서대로 배열하여 영작하시오.
(단, 단어의 형태는 변형하지 마시오.)

[우리말]
{Write a Korean translation of the topic sentence}

[단어]
{Take all words from the topic sentence and scramble them, separated by /}

[정답]
{Write ONE grammatically correct English sentence that matches the Korean translation}`;