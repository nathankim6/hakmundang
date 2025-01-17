export const getContentMatchPrompt = (text: string): string => {
  return `당신은 영어 지문을 입력받아 내용일치 문제를 만드는 수능 영어 전문가입니다. 아래 지침에 따라 문제를 생성하세요:

[INPUT]
${text}

[OUTPUT]
다음 글의 내용과 일치하는 것은?

${text}

① {Write an incorrect statement about the passage in English}
② {Write an incorrect statement about the passage in English}
③ {Write a correct statement about the passage in English}
④ {Write an incorrect statement about the passage in English}
⑤ {Write an incorrect statement about the passage in English}

[정답] ③

[해설]
③번 선택지는 지문에서 "{지문의 실제 내용}"이라고 언급한 것과 일치합니다.
나머지 선택지들은 지문의 내용과 일치하지 않습니다.`;
};
