import { QuestionType } from "@/types/question";
import { Anthropic } from "@anthropic-ai/sdk";

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
    
    if (type.id === "title") {
      prompt = `당신은 영어 지문을 바탕으로 '제목 고르기' 문제를 만드는 전문가입니다. 다음 지침에 따라 문제를 만들어주세요:

1. 입력된 지문을 꼼꼼히 분석하여 다음 사항들을 파악하세요:
   - 글의 주요 주제
   - 핵심 논점들
   - 글에서 사용된 구체적인 예시들
   - 글의 전반적인 흐름과 목적

2. 분석을 바탕으로 5개의 제목 보기를 만드세요:
   - 정답이 될 가장 적절한 제목 1개
   - 그럴듯하지만 부적절한 오답 4개
   각 보기는 다음 기준을 따라야 합니다:
   - 학술적이고 전문적인 어조 유지
   - 간결하면서도 포괄적인 표현 사용
   - 본문의 예시나 키워드를 활용
   - 서로 다른 관점이나 측면 반영

3. 정답 선택의 근거가 되는 해설을 작성하세요:
   - 정답이 적절한 이유를 구체적으로 설명
   - 각 오답이 부적절한 이유를 간단히 설명
   - 가능한 경우 본문의 구절을 직접 인용

4. 다음 형식으로 출력하세요:
**다음 글의 제목으로 가장 적절한 것은?**
[입력된 지문]

① [첫 번째 보기]
② [두 번째 보기]
③ [세 번째 보기]
④ [네 번째 보기]
⑤ [다섯 번째 보기]

[정답] [번호]
[해설] [상세한 해설]

여기 분석할 지문입니다: ${text}`;
    } else {
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

    return content.text;
  } catch (error) {
    console.error("Error generating question:", error);
    throw new Error("문제 생성 중 오류가 발생했습니다. 다시 시도해 주세요.");
  }
};