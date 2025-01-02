export const getOrderWritingPrompt = (text: string) => `
[INPUT]
${text}

[OUTPUT]
다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.

[Selected text with blank marked by 23 underscores]

[조건]
1) 12단어로 빈칸을 완성하시오.
2) 다음 단어를 한 번씩 사용하여 배열하시오.
    [12 words from the original sentence, separated by /]

[정답]
[Original sentence that fits in the blank]`;