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
        content={content}
        originalText={originalText}
      />
    );
  }

  // Default rendering for other question types
  const parts = content.split('[정답]');
  let questionPart = parts[0].trim();
  const answerPart = parts.length > 1 ? parts[1].trim() : '';

  // Extract original text if present in [INPUT] section
  let extractedOriginalText = '';
  if (questionPart.includes('[INPUT]')) {
    const inputEndIndex = questionPart.indexOf('[OUTPUT]');
    if (inputEndIndex !== -1) {
      extractedOriginalText = questionPart.substring(
        questionPart.indexOf('[INPUT]') + '[INPUT]'.length,
        inputEndIndex
      ).trim();
      questionPart = questionPart.substring(inputEndIndex + '[OUTPUT]'.length).trim();
    }
  }

  // Remove explanatory text for synonym/antonym questions
  if (content.includes('| 표제어 |') || content.includes('동의어') || content.includes('반의어')) {
    const tableStart = questionPart.indexOf('|');
    if (tableStart !== -1) {
      questionPart = questionPart.substring(tableStart);
    }
  }

  const isTrueFalse = questionPart.includes('(T/F)');
  const isOrderWriting = questionPart.includes('[우리말]');
  const isSummaryBlank = content.includes('다음 글의 내용을 아래와 같이 요약하고자 한다. 빈칸 (A), (B), (C)에 들어갈 말로 가장 적절한 것을 본문에서 찾아서 그대로 쓰시오.');
  const isTitleType = content.includes('다음 글의 제목으로 가장 적절한 것은?');
  const isIrrelevantType = content.includes('다음 글에서 전체 흐름과 관계 없는 문장은?');
  const isOrderType = content.includes('주어진 글 다음에 이어질 글의 순서로 가장 적절한 것을 고르시오.');
  const isInsertType = content.includes('글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오.');

  // Display original text if available
  const displayOriginalText = extractedOriginalText || originalText;

  // Format question part based on question type
  let formattedQuestionPart = questionPart;

  if (isTitleType) {
    formattedQuestionPart = extractedOriginalText + '\n\n다음 글의 제목으로 가장 적절한 것은?\n\n' + 
      questionPart.replace('[문제]\n다음 글의 제목으로 가장 적절한 것은?\n\n', '')
                 .replace('문제 제시: 다음 글의 제목으로 가장 적절한 것은?\n', '');
  } else if (isIrrelevantType) {
    formattedQuestionPart = '다음 글에서 전체 흐름과 관계 없는 문장은?\n\n' + 
      questionPart.replace(/문장 수가.*문제 출제가 가능합니다\.[\s\S]*?이 문장을 .*에 삽입하겠습니다\./g, '');
  } else if (isOrderType) {
    formattedQuestionPart = '주어진 글 다음에 이어질 글의 순서로 가장 적절한 것을 고르시오.\n\n' + questionPart;
  } else if (isInsertType) {
    formattedQuestionPart = '글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오.\n\n' + 
      questionPart.replace(/제공해 주신 영어 지문의.*괄호를 삽입하면 다음과 같습니다:/g, '');
  } else {
    formattedQuestionPart = displayOriginalText ? 
      displayOriginalText + '\n\n' + questionPart.replace('[문제]\n', '') : 
      questionPart.replace('[문제]\n', '');
  }

  if (isTrueFalse) {
    return (
      <TrueFalseQuestion
        questionNumber={questionNumber}
        questionPart={formattedQuestionPart}
        answerPart={answerPart}
      />
    );
  }

  if (isOrderWriting) {
    return (
      <OrderWritingQuestion
        questionNumber={questionNumber}
        questionPart={formattedQuestionPart}
        answerPart={answerPart}
      />
    );
  }

  if (isSummaryBlank) {
    return (
      <SummaryBlankQuestion
        questionNumber={questionNumber}
        questionPart={formattedQuestionPart}
        answerPart={answerPart}
      />
    );
  }

  return (
    <DefaultQuestion
      questionNumber={questionNumber}
      questionPart={formattedQuestionPart}
      answerPart={answerPart}
    />
  );
};