import { QuestionType } from "@/types/question";
import { anthropic } from "@anthropic-ai/sdk";

const questionTypes: QuestionType[] = [
  // 수능형
  { id: "purpose", name: "[18] 글의 목적" },
  { id: "mood", name: "[19] 심경/분위기" },
  { id: "claim", name: "[20] 주장" },
  { id: "implication", name: "[21] 함축의미" },
  { id: "mainPoint", name: "[22] 요지" },
  { id: "topic", name: "[23] 주제" },
  { id: "title", name: "[24] 제목" },
  { id: "grammar", name: "[29] 어법" },
  { id: "vocabulary", name: "[30] 어휘" },
  { id: "blank", name: "[31] 빈칸" },
  { id: "blankMultiple", name: "[32-34] 빈칸" },
  { id: "irrelevant", name: "[35] 무관한 문장" },
  { id: "order", name: "[36-37] 순서" },
  { id: "insert", name: "[38-39] 문장삽입" },
  { id: "summary", name: "[40] 요약문" },

  // 학교별 시그니처
  { id: "sungVocab1", name: "[숭의여고] 어휘1(동의어)" },
  { id: "sungVocab2", name: "[숭의여고] 어휘2(예문)" },
  { id: "sungExternal", name: "[숭의여고] 외부지문" },
  { id: "sungReference", name: "[숭의여고] 지칭추론" },
  { id: "seongVocab1", name: "[성남고] 어휘1(동의어)" },
  { id: "seongVocab2", name: "[성남고] 어휘2(예문)" },
  { id: "dangListen", name: "[당곡고] 듣기변형" },

  // 서술형
  { id: "descriptiveSummary", name: "[서술형] 요약문 빈칸완성" },
  { id: "descriptiveArrange", name: "[서술형] 배열영작(우리말O)" },
  { id: "descriptiveConditionKor", name: "[서술형] 조건영작(우리말O)" },
  { id: "descriptiveCondition", name: "[서술형] 조건영작(우리말X)" },
  { id: "descriptiveVocab", name: "[서술형] 어휘" },
  { id: "descriptiveGrammar", name: "[서술형] 어법" }
];

export const getQuestionTypes = () => questionTypes;

export const generateQuestion = async (type: QuestionType, text: string) => {
  const client = new anthropic({
    apiKey: localStorage.getItem("anthropicApiKey") || "",
  });

  const response = await client.completions.create({
    model: "claude-2",
    prompt: `Generate a question of type ${type.name} based on the following text: ${text}`,
    max_tokens: 150,
  });

  return response.completion;
};
