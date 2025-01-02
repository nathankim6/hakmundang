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
  getSungnamVocab2Prompt
} from "./prompts";

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
    case "dangDict":
      return getDictionaryPrompt(text);
    case "summaryBlank":
      return getSummaryBlankPrompt(text);
    case "orderWriting":
      return getOrderWritingPrompt(text);
    case "topicWriting":
      return getTopicWritingPrompt(text);
    case "sungnamVocab1":
      return getSungnamVocab1Prompt(text);
    case "sungnamVocab2":
      return getSungnamVocab2Prompt(text);
    default:
      return `Generate a question of type ${type.name} based on the following text: ${text}`;
  }
};