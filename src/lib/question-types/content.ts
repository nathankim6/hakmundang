import { QuestionType } from "@/types/question";

export const contentTypes: QuestionType[] = [
  { id: "synonymAntonym", name: "동의어/반의어" },
  { id: "trueOrFalse", name: "True or False" },
  { id: "logicFlow", name: "Logic Flow" },
  { id: "sentenceSplitter", name: "한영문장분리" },
  { id: "weekendClinic", name: "주말클리닉" },
  { id: "contentMatch", name: "내용일치" },
  { id: "contentMismatch", name: "내용불일치" },
  { id: "inference", name: "내용추론" },
  { id: "illustration", name: "삽화제작" }
];