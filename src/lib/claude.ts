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

  // 내신형
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
  { id: "descriptiveGrammar", name: "[서술형] 어법" },

  // 옳은영어 콘텐츠
  { id: "synonymAntonym", name: "동의어/반의어" },
  { id: "trueOrFalse", name: "True or False" },
  { id: "fourKings", name: "4대천왕" },
  { id: "weekendClinic", name: "주말클리닉" },
  { id: "philosophersStone", name: "Philosopher's Stone" }
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
    
    if (type.id === "purpose") {
      prompt = `당신은 영어 지문을 입력받아 한국어 선다형 문제를 만드는 전문가입니다. 다음 규칙에 따라 문제를 만들어주세요:

문제 형식:
- 제목은 항상 "다음 글의 목적으로 가장 적절한 것은?"
- 지문은 원문 그대로 사용
- 5개의 선택지를 제시 (①~⑤)
- [정답]과 [해설] 포함

선택지 작성 규칙:
- 모든 선택지는 "~하려고" 형식으로 끝나야 함
- 정답은 항상 글의 주된 목적을 반영
- 오답은 글과 관련은 있지만 주목적이 아닌 내용으로 구성
- 각 선택지는 비슷한 길이로 작성

해설 작성 규칙:
- 글의 핵심 내용을 간단히 요약
- 왜 해당 선택지가 정답인지 명확히 설명
- 한 문장으로 작성

다음 형식으로 출력해주세요:
다음 글의 목적으로 가장 적절한 것은?
[지문]
① [선택지1]
② [선택지2]
③ [선택지3]
④ [선택지4]
⑤ [선택지5]
[정답] [번호]
[해설] [설명]

여기 분석할 지문입니다:
${text}`;
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
