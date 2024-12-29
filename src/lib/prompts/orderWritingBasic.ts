export const getOrderWritingBasicPrompt = (text: string) => `Create English reading comprehension questions following this format:

[INPUT]
${text}

[OUTPUT]
다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.

${text}

[조건]
1) 주어진 단어들을 순서대로 배열하여 하나의 영어 문장을 완성하시오.
2) 단어의 형태는 변형하지 마시오.
3) 주어진 단어를 모두 한 번씩만 사용하시오.
4) 문장의 시작은 대문자로 표기하시오.
5) 문장의 끝에 마침표를 찍으시오.

주어진 단어: {Extract 8-10 key words from the passage in their base form, separated by / }

[정답]
{Write ONE grammatically correct English sentence using ALL given words in their exact form, starting with a capital letter and ending with a period}

[해설]
{Explain how the words were arranged to form a grammatically correct sentence that captures the main idea of the text}`;