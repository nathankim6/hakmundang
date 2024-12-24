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
    } else if (type.id === "mood") {
      prompt = `당신은 영어 지문을 입력받아 수능 영어시험 문제를 만드는 전문가입니다. 다음 규칙에 따라 한국어 선다형 문제를 만들어주세요:

문제 형식:
- 제목은 "다음 글에 드러난 '[인물명]'의 심경 변화로 가장 적절한 것은?"
- 지문은 원문 그대로 사용
- 5개의 선택지를 영어로 제시 (①~⑤)
- [정답]과 [풀이] 포함

선택지 작성 규칙:
- 모든 선택지는 "A → B" 형식으로 작성
- 각 심경은 적절한 영어 감정 형용사 사용
- 정답은 지문에 명확히 드러난 감정의 변화
- 오답은 문맥상 적절하지 않은 감정의 변화
- 한국어 번역을 정답 해설에 포함

풀이 작성 규칙:
- 등장인물의 초기 감정과 그 근거 설명
- 감정이 변화하게 된 계기나 상황 설명
- 정답 선택지의 한국어 의미 제시
- 오답 선택지들의 한국어 번역 포함

다음 형식으로 출력해주세요:
다음 글에 드러난 '[인물명]'의 심경 변화로 가장 적절한 것은?
[지문]
① [선택지1]
② [선택지2]
③ [선택지3]
④ [선택지4]
⑤ [선택지5]
[정답] [번호]
[풀이] [설명]
[오답 해석]
① [번역1]
② [번역2]
③ [번역3]
④ [번역4]
⑤ [번역5]

여기 분석할 지문입니다:
${text}`;
    } else if (type.id === "claim") {
      prompt = `당신은 영어 지문을 입력받아 한국어 선다형 문제를 만드는 전문가입니다. 다음 규칙에 따라 문제를 만들어주세요:

문제 형식:
- 문제 유형: "다음 글에서 필자가 주장하는 바로 가장 적절한 것은?"
- 제시문: 원문 영어 지문을 그대로 사용
- 선택지: 5개의 한글 선택지 (①~⑤)

선택지 작성 규칙:
- 모든 선택지는 "~해야 한다"로 끝나도록 작성
- 정답은 필자의 핵심 주장을 정확하게 반영
- 오답은 글의 내용과 관련되지만 핵심 주장이 아닌 내용
- 각 선택지는 간결하고 명확한 문장으로 작성
- 선택지 길이는 비슷하게 유지

다음 형식으로 출력해주세요:
다음 글에서 필자가 주장하는 바로 가장 적절한 것은?
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
    } else if (type.id === "implication") {
      prompt = `당신은 영어 지문을 입력받아 한국어 선다형 문제를 만드는 전문가입니다. 다음 규칙과 예시에 따라 문제를 만들어주세요:

문제 형식:
- 중요: 구문 앞뒤에 ** 기호를 리터럴 텍스트로 표시
- 문제 유형: '밑줄 친 "[구문]"가 다음 글에서 의미하는 바로 가장 적절한 것은?'
- 선택지는 5개의 영어 선택지 (①~⑤)

선택지 작성 규칙:
- 정답은 글의 맥락 속에서 해당 구문의 의미를 정확하게 설명
- 오답은 글의 내용과 관련되지만 구문의 실제 의미와는 다른 내용
- 모든 선택지는 완전한 영어 구문으로 작성
- 선택지는 문법적으로 올바르고 자연스러운 표현 사용
- 선택지 길이는 비슷하게 유지
- 각 선택지는 해석 가능하고 명확한 의미여야 함
- 정답은 지문의 문맥을 통해 명확히 도출될 수 있어야 함

해설 작성 규칙:
- 글의 맥락 속에서 해당 구문이 사용된 배경 설명
- 구문의 의미를 명확하게 설명
- 정답 선택지가 정답인 이유를 논리적으로 제시
- 한 문단으로 간단명료하게 작성

출제 시 주의사항:
- 선택된 구문은 글의 핵심 내용을 담고 있어야 함
- 구문의 의미는 전체 글의 맥락 없이는 파악하기 어려워야 함
- 선택지는 서로 명확히 구분되는 의미를 가져야 함
- 기계적 해석이나 단순 어휘 풀이는 지양

다음 형식으로 출력해주세요:
밑줄 친 "[구문]"가 다음 글에서 의미하는 바로 가장 적절한 것은?
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
