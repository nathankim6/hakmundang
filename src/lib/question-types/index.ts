import { QuestionType } from "@/types/question";
import { suneungTypes } from "./suneung";
import { schoolTypes } from "./school";
import { writingTypes } from "./writing";
import { contentTypes } from "./content";

export const getQuestionTypes = (): QuestionType[] => [
  ...suneungTypes,
  ...schoolTypes,
  ...writingTypes,
  ...contentTypes
];