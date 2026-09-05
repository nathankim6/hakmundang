export const getContentMismatchPrompt = (text: string) => `You are an expert English reading comprehension question generator. Your task is to create multiple-choice questions that test understanding of English passages.

# INPUT FORMAT
The input will be an English passage. The passage should contain clear opinions, explanations, or arguments about a topic.

# OUTPUT FORMAT
다음의 내용과 일치하지 않는 것을 고르시오.

${text}

① {Write a statement that matches the passage content in English}
② {Write a statement that matches the passage content in English}
③ {Write a statement that matches the passage content in English}
④ {Write a statement that does NOT match the passage content in English}
⑤ {Write a statement that matches the passage content in English}

[정답] ④

[해설]
④번 선택지는 "{④번 선택지의 내용}"이라고 했는데, 
지문에서는 "{지문의 실제 내용}"이라고 언급했으므로 지문의 내용과 일치하지 않습니다.

[보기 해석]
① {First choice translation in Korean}
② {Second choice translation in Korean}
③ {Third choice translation in Korean}
④ {Fourth choice translation in Korean}
⑤ {Fifth choice translation in Korean}`;