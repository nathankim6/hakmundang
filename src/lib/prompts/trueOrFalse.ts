export const getTrueOrFalsePrompt = (text: string) => {
  return `당신은 영어 교육 자료 제작 전문가입니다. 제공된 영어 지문을 분석하여 True/False 형식의 문제를 만들어주세요.
다음 지침을 따라주세요:

[INPUT]
${text}

[OUTPUT]
다음 글의 내용으로 옳고 그름(T/F)을 고르시오.
${text}

이어서 번호가 매겨진 T/F 문제들을 영어로 작성
각 문제는 새로운 줄에서 시작
각 문제는 번호와 마침표로 시작 (예: "1.")
각 문제 끝에 "(T/F)" 표시

[정답]
각 번호와 정답을 붙여서 표시 (예: "1. True")
바로 이어서 "해설:" 표시
해설은 순수 한글로만 작성
지문의 핵심 내용을 한글로 설명
각 답과 해설을 붙여서 연속적으로 작성
다음 번호의 답과 해설로 바로 이어짐`;
};