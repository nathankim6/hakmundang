import { QuestionType } from "@/types/question";
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
  getDictionaryPrompt,
  getSummaryBlankPrompt,
  getOrderWritingPrompt,
  getTopicWritingPrompt,
  getSungnamVocab1Prompt,
  getSungnamVocab2Prompt,
  getSungnamVocab3Prompt,
  getConditionWritingPrompt
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
  { id: "orderWriting", name: "배열영작" },
  { id: "conditionWriting", name: "조건영작" },
  { id: "summaryBlank", name: "요약문 빈칸" },
  { id: "topicWriting", name: "주제문 영작" },

  // 옳은영어 콘텐츠
  { id: "synonymAntonym", name: "동의어/반의어" },
  { id: "trueOrFalse", name: "True or False" },
  { id: "logicFlow", name: "Logic Flow" },
  { id: "sentenceSplitter", name: "한영문장분리" },
  { id: "weekendClinic", name: "주말클리닉" }
];

export const getPromptForType = (type: QuestionType, text: string): string => {
  switch (type.id) {
    case "purpose":
      return getPurposePrompt(text);
    case "claim":
      return getClaimPrompt(text);
    case "implication":
      return getImplicationPrompt(text);
    case "mood":
      return getMoodPrompt(text);
    case "mainPoint":
      return getMainPointPrompt(text);
    case "topic":
      return getTopicPrompt(text);
    case "title":
      return getTitlePrompt(text);
    case "vocabulary":
      return getVocabularyPrompt(text);
    case "blank":
      return getBlankPrompt(text);
    case "blankMultiple":
      return getBlankMultiplePrompt(text);
    case "irrelevant":
      return getIrrelevantPrompt(text);
    case "order":
      return getOrderPrompt(text);
    case "insert":
      return getInsertPrompt(text);
    case "summary":
      return getSummaryPrompt(text);
    case "trueOrFalse":
      return getTrueOrFalsePrompt(text);
    case "synonymAntonym":
      return getSynonymAntonymPrompt(text);
    case "logicFlow":
      return getLogicFlowPrompt(text);
    case "weekendClinic":
      return getWeekendClinicPrompt(text);
    case "orderWriting":
      return getOrderWritingPrompt(text);
    case "summaryBlank":
      return getSummaryBlankPrompt(text);
    case "topicWriting":
      return getTopicWritingPrompt(text);
    case "dangDict":
      return getDictionaryPrompt(text);
    case "sungnamVocab1":
      return getSungnamVocab1Prompt(text);
    case "sungnamVocab2":
      return getSungnamVocab2Prompt(text);
    case "sungnamVocab3":
      return getSungnamVocab3Prompt(text);
    case "conditionWriting":
      return getConditionWritingPrompt(text);
    default:
      return `Generate a question of type ${type.name} based on the following text: ${text}`;
  }
};