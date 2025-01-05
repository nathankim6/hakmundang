export const getOrderWritingPrompt = (text: string) => `[INPUT]
${text}

[OUTPUT]
다음 글을 읽고, 물음에 답하시오.

${text}

[문제]
다음 글의 내용을 바탕으로 주어진 단어들을 순서대로 배열하여 우리말과 같은 의미가 되도록 영작하시오.
(단, 단어의 형태는 변형하지 마시오.)

[우리말]
{Write a Korean translation of the answer sentence that captures the main idea of the text}

[단어]
{Take all words from the answer sentence and scramble them, separated by /}

[정답]
{Write ONE grammatically correct English sentence that matches the Korean translation and captures the main idea of the text}`;