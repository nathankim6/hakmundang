export const getIrrelevantPrompt = (text: string) => `다음 글에서 전체 흐름과 관계 없는 문장은?

${text}

[정답] {정답 번호}
[해설] {정답 선택지가 전체 흐름과 관계없는 이유에 대한 간단한 설명}`;