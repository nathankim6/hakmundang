import { QuestionType } from "@/types/question";
import { Anthropic } from "@anthropic-ai/sdk";
import { 
  getPurposePrompt, 
  getClaimPrompt, 
  getImplicationPrompt, 
  getMoodPrompt,
  getMainPointPrompt,
  getTopicPrompt,
  getTitlePrompt,
  getVocabularyPrompt,
  getBlankPrompt,
  getBlankMultiplePrompt,
  getIrrelevantPrompt,
  getOrderPrompt,
  getInsertPrompt,
  getSummaryPrompt,
  getTrueOrFalsePrompt,
  getSynonymAntonymPrompt,
  getLogicFlowPrompt,
  getWeekendClinicPrompt,
  getDictionaryPrompt
} from "./prompts";

export const getQuestionTypes = () => [
  // 수능형
  { id: "purpose", name: "[18] 글의 목적" },
  { id: "mood", name: "[19] 심경/분위기" },
  { id: "claim", name: "[20] 주장" },
  { id: "implication", name: "[21] 함축의미" },
  { id: "mainPoint", name: "[22] 요지" },
  { id: "topic", name: "[23] 주제" },
  { id: "title", name: "[24] 제목" },
  { id: "vocabulary", name: "[31] 어휘" },
  { id: "blank", name: "[31] 빈칸" },
  { id: "blankMultiple", name: "[32-34] 빈칸" },
  { id: "irrelevant", name: "[35] 무관한 문장" },
  { id: "order", name: "[36-37] 순서" },
  { id: "insert", name: "[38-39] 문장삽입" },
  { id: "summary", name: "[40] 요약문" },

  // 내신형
  { id: "sungnamVocab1", name: "[숭의성남] 어휘1(동의어)" },
  { id: "sungnamVocab2", name: "[숭의성남] 어휘2(예문)" },
  { id: "sungnamVocab3", name: "[숭의성남] 어휘3(영영사전)" },
  { id: "sungExternal", name: "[숭의여고] 외부지문" },
  { id: "sungReference", name: "[숭의여고] 지칭추론" },
  { id: "yeongExternal", name: "[영등포고] 외부지문" },
  { id: "dangDict", name: "[당곡고] 영영사전" },

  // 서답형
  { id: "orderWritingBasic", name: "배열영작(우리말O,어형변화X)" },
  { id: "orderWritingAdvanced", name: "배열영작(우리말O,어형변화O)" },

  // 옳은영어 전용
  { id: "synonymAntonym", name: "동의어/반의어" },
  { id: "trueOrFalse", name: "True or False" },
  { id: "logicFlow", name: "Logic Flow" },
  { id: "sentenceSplitter", name: "한영문장분리" },
  { id: "weekendClinic", name: "주말클리닉" }
];

export const generateQuestion = async (type: QuestionType, text: string) => {
  try {
    const apiKey = localStorage.getItem("claude_api_key");
    if (!apiKey) {
      throw new Error("Claude API key not found. Please enter your API key in the settings.");
    }

    const client = new Anthropic({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });

    let prompt = "";
    
    switch (type.id) {
      case "purpose":
        prompt = getPurposePrompt(text);
        break;
      case "claim":
        prompt = getClaimPrompt(text);
        break;
      case "implication":
        prompt = getImplicationPrompt(text);
        break;
      case "mood":
        prompt = getMoodPrompt(text);
        break;
      case "mainPoint":
        prompt = getMainPointPrompt(text);
        break;
      case "topic":
        prompt = getTopicPrompt(text);
        break;
      case "title":
        prompt = getTitlePrompt(text);
        break;
      case "vocabulary":
        prompt = getVocabularyPrompt(text);
        break;
      case "blank":
        prompt = getBlankPrompt(text);
        break;
      case "blankMultiple":
        prompt = getBlankMultiplePrompt(text);
        break;
      case "irrelevant":
        prompt = getIrrelevantPrompt(text);
        break;
      case "order":
        prompt = getOrderPrompt(text);
        break;
      case "insert":
        prompt = getInsertPrompt(text);
        break;
      case "summary":
        prompt = getSummaryPrompt(text);
        break;
      case "trueOrFalse":
        prompt = getTrueOrFalsePrompt(text);
        break;
      case "synonymAntonym":
        prompt = getSynonymAntonymPrompt(text);
        break;
      case "logicFlow":
        prompt = getLogicFlowPrompt(text);
        break;
      case "weekendClinic":
        prompt = getWeekendClinicPrompt(text);
        break;
      case "dangDict":
        prompt = getDictionaryPrompt(text);
        break;
      default:
        prompt = `Generate a question of type ${type.name} based on the following text: ${text}`;
    }

    const response = await client.messages.create({
      model: "claude-3-sonnet-20240229",
      messages: [{
        role: "user",
        content: prompt
      }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = response.content[0];
    
    if (!content || typeof content !== 'object' || !('type' in content) || content.type !== 'text' || !('text' in content)) {
      throw new Error("Invalid response format from Claude API");
    }

    // For weekend clinic type, we need to ensure the [OUTPUT] tag is removed
    let result = content.text;
    if (type.id === "weekendClinic") {
      result = result.replace("[OUTPUT]\n\n", "");
    }

    return result;
  } catch (error) {
    console.error("Error generating question:", error);
    throw new Error("문제 생성 중 오류가 발생했습니다. 다시 시도해 주세요.");
  }
};