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
} from "./prompts";

export const getQuestionTypes = (): QuestionType[] => [
  {
    id: "purpose",
    name: "목적",
    description: "글의 목적을 묻는 문제",
    getPrompt: getPurposePrompt,
  },
  {
    id: "mood",
    name: "분위기/심경",
    description: "글의 분위기나 심경을 묻는 문제",
    getPrompt: getMoodPrompt,
  },
  {
    id: "claim",
    name: "주장",
    description: "글쓴이의 주장을 묻는 문제",
    getPrompt: getClaimPrompt,
  },
  {
    id: "implication",
    name: "함축",
    description: "글의 함축적 의미를 묻는 문제",
    getPrompt: getImplicationPrompt,
  },
  {
    id: "mainPoint",
    name: "요지",
    description: "글의 요지를 묻는 문제",
    getPrompt: getMainPointPrompt,
  },
  {
    id: "topic",
    name: "주제",
    description: "글의 주제를 묻는 문제",
    getPrompt: getTopicPrompt,
  },
  {
    id: "title",
    name: "제목",
    description: "글의 제목을 묻는 문제",
    getPrompt: getTitlePrompt,
  },
  {
    id: "vocabulary",
    name: "어휘",
    description: "어휘 문제",
    getPrompt: getVocabularyPrompt,
  },
  {
    id: "blank",
    name: "빈칸",
    description: "빈칸 추론 문제",
    getPrompt: getBlankPrompt,
  },
  {
    id: "blankMultiple",
    name: "빈칸 (복수)",
    description: "복수 빈칸 추론 문제",
    getPrompt: getBlankMultiplePrompt,
  },
  {
    id: "irrelevant",
    name: "어색한 문장",
    description: "흐름과 무관한 문장 찾기",
    getPrompt: getIrrelevantPrompt,
  },
  {
    id: "order",
    name: "순서 배열",
    description: "문장 순서 배열하기",
    getPrompt: getOrderPrompt,
  },
  {
    id: "insert",
    name: "문장 삽입",
    description: "주어진 문장 삽입하기",
    getPrompt: getInsertPrompt,
  },
  {
    id: "summary",
    name: "요약문",
    description: "요약문 완성하기",
    getPrompt: getSummaryPrompt,
  },
  {
    id: "sungnamVocab",
    name: "성남외고 어휘",
    description: "성남외고 어휘 문제",
    getPrompt: getVocabularyPrompt,
  },
  {
    id: "sungExternal",
    name: "성남외고 외부지문",
    description: "성남외고 외부지문 문제",
    getPrompt: getVocabularyPrompt,
  },
  {
    id: "sungReference",
    name: "성남외고 지문참조",
    description: "성남외고 지문참조 문제",
    getPrompt: getVocabularyPrompt,
  },
  {
    id: "yeongExternal",
    name: "영신여고 외부지문",
    description: "영신여고 외부지문 문제",
    getPrompt: getVocabularyPrompt,
  },
  {
    id: "dangDict",
    name: "당곡고 사전활용",
    description: "당곡고 사전활용 문제",
    getPrompt: getDictionaryPrompt,
  },
  {
    id: "daeguGirls1",
    name: "[임시]대구여고1",
    description: "대구여고 문제 유형 1",
    getPrompt: getVocabularyPrompt,
  },
  {
    id: "daeguGirls2", 
    name: "[임시]대구여고2",
    description: "대구여고 문제 유형 2", 
    getPrompt: getVocabularyPrompt,
  }
];

export { generateQuestion } from './question-generator';
