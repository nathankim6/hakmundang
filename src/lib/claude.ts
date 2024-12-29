import { QuestionType } from "@/types/question";
import { readingTypes, schoolTypes, writingTypes, contentTypes } from "./question-types";

export const getQuestionTypes = (): QuestionType[] => [
  ...readingTypes,
  ...schoolTypes,
  ...writingTypes,
  ...contentTypes,
];

export { generateQuestion } from './question-generator';