import { QuestionType } from "@/types/question";
import { 
  getBlankPrompt, getBlankMultiplePrompt, getClaimPrompt,
  getDictionaryPrompt, getImplicationPrompt, getInsertPrompt,
  getIrrelevantPrompt, getLogicFlowPrompt, getMainPointPrompt,
  getMoodPrompt, getOrderPrompt, getOrderWritingAdvancedPrompt,
  getOrderWritingBasicPrompt, getPurposePrompt, getSummaryBlankPrompt,
  getSummaryPrompt, getSynonymAntonymPrompt, getTitlePrompt,
  getTopicPrompt, getTrueOrFalsePrompt, getVocabularyPrompt,
  getWeekendClinicPrompt,
} from "../prompts";

// Reading comprehension types (수능형)
export const readingTypes: QuestionType[] = [
  {
    id: "purpose",
    name: "목적",
    getPrompt: getPurposePrompt,
  },
  {
    id: "mood",
    name: "분위기/심경",
    getPrompt: getMoodPrompt,
  },
  {
    id: "claim",
    name: "주장",
    getPrompt: getClaimPrompt,
  },
  {
    id: "implication",
    name: "함축",
    getPrompt: getImplicationPrompt,
  },
  {
    id: "mainPoint",
    name: "요지",
    getPrompt: getMainPointPrompt,
  },
  {
    id: "topic",
    name: "주제",
    getPrompt: getTopicPrompt,
  },
  {
    id: "title",
    name: "제목",
    getPrompt: getTitlePrompt,
  },
  {
    id: "vocabulary",
    name: "어휘",
    getPrompt: getVocabularyPrompt,
  },
  {
    id: "blank",
    name: "빈칸",
    getPrompt: getBlankPrompt,
  },
  {
    id: "blankMultiple",
    name: "빈칸 (복수)",
    getPrompt: getBlankMultiplePrompt,
  },
  {
    id: "irrelevant",
    name: "무관한 문장",
    getPrompt: getIrrelevantPrompt,
  },
  {
    id: "order",
    name: "순서",
    getPrompt: getOrderPrompt,
  },
  {
    id: "insert",
    name: "삽입",
    getPrompt: getInsertPrompt,
  },
  {
    id: "summary",
    name: "요약문",
    getPrompt: getSummaryPrompt,
  }
];

// School exam types (내신형)
export const schoolTypes: QuestionType[] = [
  {
    id: "sungnamVocab",
    name: "성남외고 어휘",
    getPrompt: getVocabularyPrompt,
  },
  {
    id: "sungExternal",
    name: "성남외고 외부지문",
    getPrompt: getVocabularyPrompt,
  },
  {
    id: "sungReference",
    name: "성남외고 지문참조",
    getPrompt: getVocabularyPrompt,
  },
  {
    id: "yeongExternal",
    name: "영신여고 외부지문",
    getPrompt: getVocabularyPrompt,
  },
  {
    id: "dangDict",
    name: "당곡고 사전활용",
    getPrompt: getDictionaryPrompt,
  },
  {
    id: "daeguGirls1",
    name: "[임시]대구여고1",
    getPrompt: getVocabularyPrompt,
  },
  {
    id: "daeguGirls2", 
    name: "[임시]대구여고2",
    getPrompt: getVocabularyPrompt,
  },
];

// Writing types (서답형)
export const writingTypes: QuestionType[] = [
  {
    id: "orderWritingBasic",
    name: "우리말 순서 배열 (기본)",
    getPrompt: getOrderWritingBasicPrompt,
  },
  {
    id: "orderWritingAdvanced",
    name: "우리말 순서 배열 (심화)",
    getPrompt: getOrderWritingAdvancedPrompt,
  },
  {
    id: "summaryBlank",
    name: "요약문 빈칸",
    getPrompt: getSummaryBlankPrompt,
  },
];

// Content types (옳은영어 콘텐츠)
export const contentTypes: QuestionType[] = [
  {
    id: "synonymAntonym",
    name: "동의어/반의어",
    getPrompt: getSynonymAntonymPrompt,
  },
  {
    id: "trueOrFalse",
    name: "참/거짓",
    getPrompt: getTrueOrFalsePrompt,
  },
  {
    id: "logicFlow",
    name: "논리 전개",
    getPrompt: getLogicFlowPrompt,
  },
  {
    id: "weekendClinic",
    name: "주말진료소",
    getPrompt: getWeekendClinicPrompt,
  },
];

export { generateQuestion } from '../question-generator';