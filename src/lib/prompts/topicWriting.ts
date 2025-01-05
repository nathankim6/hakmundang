export const getTopicWritingPrompt = (text: string) => `[INPUT]
${text}

[OUTPUT]
다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.

${text}

[조건]
1) 10단어로 빈칸을 완성하시오.
2) 다음 단어를 한 번씩 사용하여 배열하시오.
    {List 10 key words from the passage, separated by / }

주제문: __________________________________________.

[정답]
{Write a 10-word sentence using all given words}`;