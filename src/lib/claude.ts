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
    name: "함의",
  },
  {
    id: "mainPoint",
    name: "주요 내용",
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
    id: "weekendClinic",
    name: "주말 클리닉",
  },
  {
    id: "trueOrFalse",
    name: "참/거짓",
  },
  {
    id: "synonymAntonym",
    name: "동의어/반의어",
  },
  {
    id: "logicFlow",
    name: "논리 흐름",
  },
  {
    id: "sentenceSplitter",
    name: "문장 분리",
  },
  {
    id: "topicWriting",
    name: "주제문 영작",
    prompt: `Given the Korean text, generate an English translation that captures the main topic sentence. Format the response as a JSON object with the following structure:
    {
      "question": "Write the topic sentence in English using the given words.",
      "answer": "The complete English sentence"
    }`
  },
  {
    id: "orderWritingBasic",
    name: "기본 서답형",
  },
  {
    id: "orderWritingAdvanced",
    name: "고급 서답형",
  },
  {
    id: "summaryBlank",
    name: "요약 빈칸",
  },
];

export const generateQuestion = async (type: { id: string; name: string; prompt?: string }, text: string) => {
  try {
    // For now, return a simple response for testing
    return JSON.stringify([{ english: "Sample English", korean: "샘플 한글" }]);
  } catch (error) {
    console.error('Error generating question:', error);
    throw error;
  }
};