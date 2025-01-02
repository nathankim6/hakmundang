import { QuestionType } from "@/types/question";
import { Anthropic } from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { getPromptForType } from "./questionTypes";

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
  { id: "summaryBlank", name: "요약문 빈칸완성" },
  { id: "topicWriting", name: "주제문 영작" },

  // 옳은영어 콘텐츠
  { id: "synonymAntonym", name: "동의어/반의어" },
  { id: "trueOrFalse", name: "True or False" },
  { id: "logicFlow", name: "Logic Flow" },
  { id: "sentenceSplitter", name: "한영문장분리" },
  { id: "weekendClinic", name: "주말클리닉" }
];

export const generateQuestion = async (type: QuestionType, text: string) => {
  try {
    const claudeApiKey = localStorage.getItem("claude_api_key");
    const gptApiKey = localStorage.getItem("gpt_api_key");
    
    // Use Claude if it's available or if GPT key is not set
    const useClaudeApi = claudeApiKey || !gptApiKey;
    
    if (!claudeApiKey && !gptApiKey) {
      throw new Error("API key not found. Please enter your API key in the settings.");
    }

    const prompt = getPromptForType(type, text);

    if (useClaudeApi) {
      const client = new Anthropic({
        apiKey: claudeApiKey,
        dangerouslyAllowBrowser: true
      });

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

      let result = content.text;
      if (type.id === "weekendClinic") {
        result = result.replace("[OUTPUT]\n\n", "");
      }

      return result;
    } else {
      const openai = new OpenAI({
        apiKey: gptApiKey,
        dangerouslyAllowBrowser: true
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      let result = response.choices[0]?.message?.content;
      
      if (!result) {
        throw new Error("Invalid response format from GPT API");
      }

      if (type.id === "weekendClinic") {
        result = result.replace("[OUTPUT]\n\n", "");
      }

      return result;
    }
  } catch (error) {
    console.error("Error generating question:", error);
    throw new Error("문제 생성 중 오류가 발생했습니다. 다시 시도해 주세요.");
  }
};