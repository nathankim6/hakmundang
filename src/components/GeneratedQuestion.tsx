import { Card, CardContent } from "@/components/ui/card";
import { TrueFalseQuestion } from "./question-types/TrueFalseQuestion";
import { OrderWritingQuestion } from "./question-types/OrderWritingQuestion";
import { WeekendClinicQuestion } from "./question-types/WeekendClinicQuestion";
import { SummaryBlankQuestion } from "./question-types/SummaryBlankQuestion";
import { DefaultQuestion } from "./question-types/DefaultQuestion";

interface GeneratedQuestionProps {
  content: string;
  questionNumber: number;
  originalText?: string;
  showVocabButton?: boolean;
}

export const GeneratedQuestion = ({ 
  content, 
  questionNumber, 
  originalText,
  showVocabButton = true
}: GeneratedQuestionProps) => {
  // Special handling for weekend clinic format
  if (originalText) {
    return (
      <WeekendClinicQuestion
        questionNumber={questionNumber}
        content={content.replace("[OUTPUT]", "").trim()}
        originalText={originalText}
      />
    );
  }

  // Default rendering for other question types
  const parts = content.split('[정답]');
  let questionPart = parts[0].trim();
  const answerPart = parts.length > 1 ? parts[1].trim() : '';

  // Remove [INPUT] section if present
  if (questionPart.includes('[INPUT]')) {
    const inputEndIndex = questionPart.indexOf('[OUTPUT]');
    if (inputEndIndex !== -1) {
      questionPart = questionPart.substring(inputEndIndex + '[OUTPUT]'.length);
    }
  }

  // Remove [OUTPUT] text
  questionPart = questionPart.replace("[OUTPUT]", "").trim();

  // Remove explanatory text for synonym/antonym questions
  if (content.includes('| 표제어 |') || content.includes('동의어') || content.includes('반의어')) {
    const tableStart = questionPart.indexOf('|');
    if (tableStart !== -1) {
      questionPart = questionPart.substring(tableStart);
    }
  }

  // Check for specific question types
  const isTrueFalse = questionPart.includes('(T/F)');
  const isOrderWriting = questionPart.includes('[우리말]');
  const isSummaryBlank = content.includes('다음 글의 내용을 아래와 같이 요약하고자 한다. 빈칸 (A), (B), (C)에 들어갈 말로 가장 적절한 것을 본문에서 찾아서 그대로 쓰시오.');
  const isIrrelevantSentence = questionPart.includes('다음 글에서 전체 흐름과 관계 없는 문장은?');
  const isInsertQuestion = questionPart.includes('글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오.');

  if (isTrueFalse) {
    return (
      <TrueFalseQuestion
        questionNumber={questionNumber}
        questionPart={questionPart}
        answerPart={answerPart}
      />
    );
  }

  if (isOrderWriting) {
    return (
      <OrderWritingQuestion
        questionNumber={questionNumber}
        questionPart={questionPart}
        answerPart={answerPart}
      />
    );
  }

  if (isSummaryBlank) {
    return (
      <SummaryBlankQuestion
        questionNumber={questionNumber}
        questionPart={questionPart}
        answerPart={answerPart}
      />
    );
  }

  // For irrelevant sentence questions, combine question and answer in one section
  if (isIrrelevantSentence) {
    const combinedContent = `${questionPart}\n\n[정답] ${answerPart}`;
    return (
      <DefaultQuestion
        questionNumber={questionNumber}
        questionPart={combinedContent}
        answerPart=""
      />
    );
  }

  return (
    <DefaultQuestion
      questionNumber={questionNumber}
      questionPart={questionPart}
      answerPart={answerPart ? `[정답] ${answerPart}` : ""}
    />
  );
};