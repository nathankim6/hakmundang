
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
  getSummaryVocabPrompt,
  getOrderWritingPrompt,
  getOrderWritingKoreanPrompt,
  getTopicWritingPrompt,
  getConditionWritingPrompt,
  getContentMismatchPrompt,
  getContentMatchPrompt,
  getVocabWorkbookPrompt,
  getGrammarWorkbookPrompt,
  getGrammarPrompt,
  getConjunctionPrompt,
  getCollocationPrompt,
  getExampleSentencesPrompt,
  getReferencePrompt,
  getReferenceInferencePrompt,
  getContentInferencePrompt
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
  { id: "contentMismatch", name: "[25-27] 내용불일치" },
  { id: "contentMatch", name: "[28] 내용일치" },
  { id: "grammar", name: "[29] 어법" },
  { id: "vocabulary", name: "[30] 어휘" },
  { id: "blank", name: "[31] 빈칸" },
  { id: "blankMultiple", name: "[32-34] 빈칸" },
  { id: "irrelevant", name: "[35] 무관한 문장" },
  { id: "order", name: "[36-37] 순서" },
  { id: "insert", name: "[38-39] 문장삽입" },
  { id: "summary", name: "[40] 요약문" },

  // 내신형
  { id: "dictionary", name: "[내신형] 영영사전" },
  { id: "collocation", name: "[내신형] 동반의어 찾기" },
  { id: "exampleSentences", name: "[내신형] 예문" },
  { id: "reference", name: "[내신형] 사례추론" },
  { id: "contentInference", name: "[내신형] 내용추론" },
  { id: "referenceInference", name: "[내신형] 지칭추론" },
  { id: "conjunction", name: "[내신형] 연결사" },
  { id: "trueOrFalse", name: "[내신형] True or False" },

  // 서답형
  { id: "orderWritingKorean", name: "배열영작(우리말O)" },
  { id: "orderWriting", name: "배열영작(우리말X)" },
  
  { id: "summaryBlank", name: "요약문 빈칸어휘" },
  { id: "summaryVocab", name: "요약문 빈칸영작" },
  { id: "topicWriting", name: "주제문영작" },

  // 워크북 제작
  { id: "grammarWorkbook", name: "어법워크북" },
  { id: "vocabWorkbook", name: "어휘워크북" },

  // 기타 콘텐츠
  { id: "synonymAntonym", name: "동의어/반의어" },
  { id: "logicFlow", name: "Logic Flow" },
  { id: "sentenceSplitter", name: "한영문장분리" },
  { id: "weekendClinic", name: "주말클리닉" },
  { id: "illustration", name: "삽화제작" }
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
    case "orderWritingKorean":
      return getOrderWritingKoreanPrompt(text);
    case "summaryBlank":
      return getSummaryBlankPrompt(text);
    case "summaryVocab":
      return getSummaryVocabPrompt(text);
    case "topicWriting":
      return getTopicWritingPrompt(text);
    case "contentMismatch":
      return getContentMismatchPrompt(text);
    case "contentMatch":
      return getContentMatchPrompt(text);
    case "vocabWorkbook":
      return getVocabWorkbookPrompt(text);
    case "grammarWorkbook":
      return getGrammarWorkbookPrompt(text);
    case "grammar":
      return getGrammarPrompt(text);
    case "conjunction":
      return getConjunctionPrompt(text);
    case "collocation":
      return getCollocationPrompt(text);
    case "exampleSentences":
      return getExampleSentencesPrompt(text);
    case "reference":
      return getReferencePrompt(text);
    case "referenceInference":
      return getReferenceInferencePrompt(text);
    case "contentInference":
      return getContentInferencePrompt(text);
    case "dictionary":
      return getDictionaryPrompt(text);
    default:
      return `Generate a question of type ${type.name} based on the following text: ${text}`;
  }
};
