import { QuestionType } from "@/types/question";

export const getQuestionTypes = (): QuestionType[] => [
  // 수능형
  { id: "18", name: "[18] 글의 목적", prompt: "글의 목적을 파악하는 문제를 생성해주세요." },
  { id: "19", name: "[19] 심경/분위기", prompt: "심경/분위기를 파악하는 문제를 생성해주세요." },
  { id: "20", name: "[20] 주장", prompt: "글의 주장을 파악하는 문제를 생성해주세요." },
  { id: "21", name: "[21] 함축의미", prompt: "함축의미를 파악하는 문제를 생성해주세요." },
  { id: "22", name: "[22] 요지", prompt: "글의 요지를 파악하는 문제를 생성해주세요." },
  { id: "23", name: "[23] 주제", prompt: "글의 주제를 파악하는 문제를 생성해주세요." },
  { id: "24", name: "[24] 제목", prompt: "글의 제목을 파악하는 문제를 생성해주세요." },
  { id: "29", name: "[29] 어법", prompt: "어법 관련 문제를 생성해주세요." },
  { id: "30", name: "[30] 어휘", prompt: "어휘 관련 문제를 생성해주세요." },
  { id: "31", name: "[31] 빈칸", prompt: "빈칸 추론 문제를 생성해주세요." },
  { id: "32", name: "[32-34] 빈칸", prompt: "긴 지문의 빈칸 추론 문제를 생성해주세요." },
  { id: "35", name: "[35] 무관한 문장", prompt: "무관한 문장을 찾는 문제를 생성해주세요." },
  { id: "36", name: "[36-37] 순서", prompt: "문장의 순서를 파악하는 문제를 생성해주세요." },
  { id: "38", name: "[38-39] 문장삽입", prompt: "문장을 삽입하는 문제를 생성해주세요." },
  { id: "40", name: "[40] 요약문", prompt: "요약문 완성 문제를 생성해주세요." },

  // 학교별 시그니처
  { id: "sw1", name: "[숭의여고] 어휘1(동의어)", prompt: "숭의여고 스타일의 동의어 문제를 생성해주세요." },
  { id: "sw2", name: "[숭의여고] 어휘2(예문)", prompt: "숭의여고 스타일의 어휘 예문 문제를 생성해주세요." },
  { id: "sw3", name: "[숭의여고] 외부지문", prompt: "숭의여고 스타일의 외부지문 문제를 생성해주세요." },
  { id: "sw4", name: "[숭의여고] 지칭추론", prompt: "숭의여고 스타일의 지칭추론 문제를 생성해주세요." },
  { id: "sn1", name: "[성남고] 어휘1(동의어)", prompt: "성남고 스타일의 동의어 문제를 생성해주세요." },
  { id: "sn2", name: "[성남고] 어휘2(예문)", prompt: "성남고 스타일의 어휘 예문 문제를 생성해주세요." },
  { id: "dg1", name: "[당곡고] 듣기변형", prompt: "당곡고 스타일의 듣기 변형 문제를 생성해주세요." },

  // 서술형
  { id: "d1", name: "[서술형] 요약문 빈칸완성", prompt: "요약문 빈칸완성 서술형 문제를 생성해주세요." },
  { id: "d2", name: "[서술형] 배열영작(우리말O)", prompt: "우리말이 있는 배열영작 서술형 문제를 생성해주세요." },
  { id: "d3", name: "[서술형] 조건영작(우리말O)", prompt: "우리말이 있는 조건영작 서술형 문제를 생성해주세요." },
  { id: "d4", name: "[서술형] 조건영작(우리말X)", prompt: "우리말이 없는 조건영작 서술형 문제를 생성해주세요." },
  { id: "d5", name: "[서술형] 어휘", prompt: "어휘 관련 서술형 문제를 생성해주세요." },
  { id: "d6", name: "[서술형] 어법", prompt: "어법 관련 서술형 문제를 생성해주세요." },
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
