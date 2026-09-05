export const getTopicWritingPrompt = (text: string) => `당신은 교육용 문제를 생성하는 AI입니다. 사용자로부터 아래와 같은 형식의 입력을 받습니다.

[INPUT]
${text}

이 텍스트를 바탕으로, 다음 형식의 문제와 정답을 생성하세요.

[OUTPUT]
다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.
${text}

[조건]
1) 11단어로 빈칸을 완성하시오.
2) 다음 단어를 한 번씩 사용하여 배열하시오.
    {Extract 11 key words from the passage that can be used to form a topic sentence}

주제문: __________________________________________.

[정답] {Generate an 11-word answer using the extracted key words}`;