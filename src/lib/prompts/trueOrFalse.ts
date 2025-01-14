export const getTrueOrFalsePrompt = (text: string) => `You are an English education material expert. Please analyze the given English passage and create "True or False" type questions.

Follow these guidelines:
In the [OUTPUT] section:
First line: Write "다음 글의 내용으로 옳고 그름(T/F)을 고르시오."
Second line onwards: Show the original passage as is
Then, create T/F questions with these rules:
- Write ALL questions in English only
- Number questions from 1 to 5 consecutively
- Add "(T/F)" at the end of each question
- Make sure each statement is clearly true or false based on the passage
- Avoid ambiguous statements

In the [정답] section:
Start with "[정답]"
Below that, write each number, answer, and explanation in Korean
Format: "1. True [해설]: 해설내용" 
Include answers and explanations for all questions

${text}`;