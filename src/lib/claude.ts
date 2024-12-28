export const getQuestionTypes = () => [
  {
    id: "purpose",
    name: "목적",
  },
  {
    id: "mood",
    name: "기분",
  },
  {
    id: "claim",
    name: "주장",
  },
  {
    id: "implication",
    name: "암시",
  },
  {
    id: "mainPoint",
    name: "주요점",
  },
  {
    id: "topic",
    name: "주제",
  },
  {
    id: "title",
    name: "제목",
  },
  {
    id: "vocabulary",
    name: "어휘",
  },
  {
    id: "blank",
    name: "빈칸",
  },
  {
    id: "blankMultiple",
    name: "복수 빈칸",
  },
  {
    id: "irrelevant",
    name: "무관한 내용",
  },
  {
    id: "order",
    name: "순서",
  },
  {
    id: "insert",
    name: "삽입",
  },
  {
    id: "summary",
    name: "요약",
  },
  {
    id: "sungA",
    name: "성동고 A형",
  },
  {
    id: "sungB",
    name: "성동고 B형",
  },
  {
    id: "seongA",
    name: "성수고 A형",
  },
  {
    id: "seongB",
    name: "성수고 B형",
  },
  {
    id: "dangA",
    name: "당산고 A형",
  },
  {
    id: "dangB",
    name: "당산고 B형",
  },
  {
    id: "dangC",
    name: "당산고 C형",
  },
  {
    id: "conditionalWriting",
    name: "서답형(조건영작)",
  },
  {
    id: "orderWriting",
    name: "서답형(배열영작)",
  },
  {
    id: "summaryWriting",
    name: "서답형(요약문)",
  },
  {
    id: "synonymAntonym",
    name: "동의어/반의어",
  },
  {
    id: "trueOrFalse",
    name: "참/거짓",
  },
  {
    id: "logicFlow",
    name: "논리 흐름",
  },
  {
    id: "sentenceSplitter",
    name: "문장 분리기",
  },
  {
    id: "weekendClinic",
    name: "주말 클리닉",
  },
];

export const generateQuestion = async (type: { id: string; name: string }, text: string) => {
  const prompt = await import(`./prompts/${type.id}`).then(module => {
    const promptFn = Object.values(module)[0];
    return promptFn(text);
  });

  // Here you would typically make an API call to generate the question
  // For now, we'll return a placeholder response
  return `Generated question for ${type.name} using text: ${text}`;
};