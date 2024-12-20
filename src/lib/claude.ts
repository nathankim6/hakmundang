import Anthropic from '@anthropic-ai/sdk';
import { QuestionType } from "@/types/question";

export const getQuestionTypes = () => QUESTION_TYPES;

const QUESTION_TYPES: QuestionType[] = [
  {
    id: "extract",
    name: "제목",
    prompt: "주어진 지문을 바탕으로 제목에 관한 문제를 생성해주세요. 문제, 보기, 정답, 해설을 포함해주세요.",
  },
  {
    id: "main-idea",
    name: "주제",
    prompt: "주어진 지문을 바탕으로 주제에 관한 문제를 생성해주세요. 문제, 보기, 정답, 해설을 포함해주세요.",
  },
  {
    id: "development",
    name: "발전",
    prompt: "주어진 지문을 바탕으로 글의 발전 과정에 관한 문제를 생성해주세요. 문제, 보기, 정답, 해설을 포함해주세요.",
  },
  {
    id: "vocabulary",
    name: "어휘",
    prompt: "주어진 지문을 바탕으로 어휘에 관한 문제를 생성해주세요. 문제, 보기, 정답, 해설을 포함해주세요.",
  },
  {
    id: "order",
    name: "순서",
    prompt: "주어진 지문을 바탕으로 글의 순서에 관한 문제를 생성해주세요. 문제, 보기, 정답, 해설을 포함해주세요.",
  },
  {
    id: "insert",
    name: "삽입",
    prompt: "주어진 지문을 바탕으로 문장 삽입에 관한 문제를 생성해주세요. 문제, 보기, 정답, 해설을 포함해주세요.",
  },
  {
    id: "inference",
    name: "추론",
    prompt: "주어진 지문을 바탕으로 추론에 관한 문제를 생성해주세요. 문제, 보기, 정답, 해설을 포함해주세요.",
  },
  {
    id: "logical",
    name: "논리",
    prompt: "주어진 지문을 바탕으로 논리적 추론에 관한 문제를 생성해주세요. 문제, 보기, 정답, 해설을 포함해주세요.",
  },
  {
    id: "true-false",
    name: "True or False",
    prompt: "주어진 지문을 바탕으로 참/거짓을 판단하는 문제를 생성해주세요. 문제, 보기, 정답, 해설을 포함해주세요.",
  },
  {
    id: "four-blanks",
    name: "4태천왕",
    prompt: "주어진 지문을 바탕으로 4개의 빈칸을 채우는 문제를 생성해주세요. 문제, 보기, 정답, 해설을 포함해주세요.",
  },
  {
    id: "parallel",
    name: "동반이",
    prompt: "주어진 지문을 바탕으로 동반 관계를 찾는 문제를 생성해주세요. 문제, 보기, 정답, 해설을 포함해주세요.",
  },
  {
    id: "summary-short",
    name: "서술형(배점)",
    prompt: "주어진 지문을 바탕으로 서술형 문제를 생성해주세요. 문제, 모범답안, 해설을 포함해주세요.",
  },
  {
    id: "summary-long",
    name: "서술형(조건)",
    prompt: "주어진 지문을 바탕으로 조건이 있는 서술형 문제를 생성해주세요. 문제, 조건, 모범답안, 해설을 포함해주세요.",
  },
  {
    id: "summary-guide",
    name: "서술형(요지)",
    prompt: "주어진 지문을 바탕으로 요지를 서술하는 문제를 생성해주세요. 문제, 모범답안, 해설을 포함해주세요.",
  }
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
    dangerouslyAllowBrowser: true
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

    if (!message.content || message.content.length === 0) {
      throw new Error("API 응답이 비어있습니다.");
    }

    const textContent = message.content[0];
    if (textContent.type !== 'text') {
      throw new Error("예상치 못한 응답 형식입니다.");
    }

    return textContent.text;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw new Error("문제 생성 중 오류가 발생했습니다.");
  }
};