import { getContentMatchPrompt } from "./contentMatch";
import { getContentMismatchPrompt } from "./contentMismatch";
import { getInferencePrompt } from "./inference";
import { getPurposePrompt } from "./purpose";
import { getClaimPrompt } from "./claim";
import { getImplicationPrompt } from "./implication";
import { getMoodPrompt } from "./mood";
import { getMainPointPrompt } from "./mainPoint";
import { getTopicPrompt } from "./topic";
import { getTitlePrompt } from "./title";
import { getVocabularyPrompt } from "./vocabulary";
import { getBlankPrompt } from "./blank";
import { getBlankMultiplePrompt } from "./blankMultiple";
import { getIrrelevantPrompt } from "./irrelevant";
import { getOrderPrompt } from "./order";
import { getInsertPrompt } from "./insert";
import { getSummaryPrompt } from "./summary";
import { getTrueOrFalsePrompt } from "./trueOrFalse";
import { getSynonymAntonymPrompt } from "./synonymAntonym";
import { getLogicFlowPrompt } from "./logicFlow";
import { getWeekendClinicPrompt } from "./weekendClinic";
import { getOrderWritingPrompt } from "./orderWriting";
import { getSummaryBlankPrompt } from "./summaryBlank";
import { getTopicWritingPrompt } from "./topicWriting";
import { getDictionaryPrompt } from "./dictionary";
import { getSungnamVocab1Prompt } from "./sungnamVocab1";
import { getSungnamVocab2Prompt } from "./sungnamVocab2";
import { getSungnamVocab3Prompt } from "./sungnamVocab3";
import { getIllustrationPrompt } from "./illustration";
import { QuestionType } from "@/types/question";

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
    case "contentMatch":
      return getContentMatchPrompt(text);
    case "contentMismatch":
      return getContentMismatchPrompt(text);
    case "inference":
      return getInferencePrompt(text);
    case "illustration":
      return getIllustrationPrompt(text);
    case "sungnamVocab1":
      return getSungnamVocab1Prompt(text);
    case "sungnamVocab2":
      return getSungnamVocab2Prompt(text);
    case "sungnamVocab3":
      return getSungnamVocab3Prompt(text);
    default:
      return `Generate a question of type ${type.name} based on the following text: ${text}`;
  }
};

export {
  getContentMatchPrompt,
  getContentMismatchPrompt,
  getInferencePrompt,
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
  getOrderWritingPrompt,
  getSummaryBlankPrompt,
  getTopicWritingPrompt,
  getDictionaryPrompt,
  getSungnamVocab1Prompt,
  getSungnamVocab2Prompt,
  getSungnamVocab3Prompt,
  getIllustrationPrompt
};