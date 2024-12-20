import Anthropic from '@anthropic-ai/sdk';
import { QuestionType } from "@/types/question";

export const getQuestionTypes = () => QUESTION_TYPES;

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

export const generateQuestion = async (
  type: QuestionType,
  text: string
): Promise<string> => {
  const apiKey = localStorage.getItem("CLAUDE_API_KEY");
  
  if (!apiKey) {
    throw new Error("API 키가 설정되지 않았습니다.");
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `${type.prompt}\n\n지문: ${text}`
      }]
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw new Error("문제 생성 중 오류가 발생했습니다.");
  }
};