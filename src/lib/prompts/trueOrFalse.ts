export const getTrueOrFalsePrompt = (text: string) => `당신은 영어 지문을 입력받아 True/False 문제를 만드는 전문가입니다. 다음 규칙과 예시에 따라 문제를 만들어주세요:

[INPUT]
${text}
[OUTPUT]
다음 글의 내용으로 옳고 그름(T/F)을 고르시오.
${text}

{지문 내용에 기반한 진술 1} (T/F)
{지문 내용에 기반한 진술 2} (T/F)
{지문 내용에 기반한 진술 3} (T/F)
{지문 내용에 기반한 진술 4} (T/F)
{지문 내용에 기반한 진술 5} (T/F)`;