import { QuestionType } from "@/types/question";

const QUESTION_TYPES: QuestionType[] = [
  {
    id: "multiple-choice",
    name: "객관식",
    prompt: "주어진 지문을 바탕으로 4지선다형 객관식 문제를 생성해주세요. 문제, 보기, 정답, 해설을 포함해주세요.",
  },
  {
    id: "short-answer",
    name: "주관식",
    prompt: "주어진 지문을 바탕으로 주관식 문제를 생성해주세요. 문제, 모범답안, 해설을 포함해주세요.",
  },
];

export const getQuestionTypes = () => QUESTION_TYPES;

export const generateQuestion = async (
  type: QuestionType,
  text: string
): Promise<string> => {
  const apiKey = localStorage.getItem("CLAUDE_API_KEY");
  
  if (!apiKey) {
    throw new Error("API 키가 설정되지 않았습니다.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `${type.prompt}\n\n지문: ${text}`
      }]
    }),
  });

  if (!response.ok) {
    throw new Error("API 요청 실패");
  }

  const data = await response.json();
  return data.content[0].text;
};