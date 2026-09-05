
import { useState } from "react";
import { DefaultQuestion } from "./question-types/DefaultQuestion";
import { WeekendClinicQuestion } from "./question-types/WeekendClinicQuestion";
import { TrueFalseQuestion } from "./question-types/TrueFalseQuestion";
import { SummaryBlankQuestion } from "./question-types/SummaryBlankQuestion";
import { OrderWritingQuestion } from "./question-types/OrderWritingQuestion";
import { ConditionWritingQuestion } from "./question-types/ConditionWritingQuestion";
import { GrammarQuestion } from "./question-types/GrammarQuestion";
import { RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";
import { generateQuestion } from "@/lib/claude";
import { useToast } from "@/hooks/use-toast";

interface GeneratedQuestionProps {
  content: string;
  questionNumber: number;
  originalText?: string;
  showVocabButton?: boolean;
  onRefresh?: (newContent: string) => void;
  questionType?: string;
}

export const GeneratedQuestion = ({
  content,
  questionNumber,
  originalText,
  showVocabButton = true,
  onRefresh,
  questionType
}: GeneratedQuestionProps) => {
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Remove [OUTPUT] text and any following newlines
  const cleanedContent = content.replace(/\[OUTPUT\]\s*/g, '');

  // Split content into question and answer parts
  const parts = cleanedContent.split('[정답]');
  const questionPart = parts[0].trim();
  const answerPart = parts[1]?.trim() || '';

  const handleRefresh = async () => {
    if (!originalText || !questionType || !onRefresh) return;

    setIsRefreshing(true);
    try {
      const result = await generateQuestion({ id: questionType, name: "" }, originalText, "1");
      onRefresh(result);
      toast({
        title: "문제 재생성 완료",
        description: "문제가 성공적으로 재생성되었습니다.",
      });
    } catch (error) {
      toast({
        title: "문제 재생성 실패",
        description: "문제 재생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Determine question type based on content
  const isWeekendClinic = cleanedContent.includes('주말클리닉');
  const isTrueFalse = cleanedContent.includes('True or False');
  const isSummaryBlank = cleanedContent.includes('요약문 빈칸');
  const isOrderWriting = cleanedContent.includes('배열영작');
  const isConditionWriting = cleanedContent.includes('조건영작');
  const isGrammarQuestion = cleanedContent.includes('[29] 어법') || questionPart.includes('다음 중 어법상');

  const RefreshButton = () => (
    <Button
      variant="outline"
      size="sm"
      className="absolute top-4 right-4"
      onClick={handleRefresh}
      disabled={isRefreshing || !originalText}
    >
      <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
    </Button>
  );

  // For grammar questions, format the content properly
  if (isGrammarQuestion) {
    // Extract only the actual question part after [문제]
    const questionMatch = questionPart.match(/\[문제\]\s*([\s\S]*)/);
    const actualQuestion = questionMatch ? questionMatch[1].trim() : questionPart;
    
    return (
      <div className="relative">
        <RefreshButton />
        <GrammarQuestion
          questionNumber={questionNumber}
          questionPart={actualQuestion}
          answerPart={answerPart}
        />
      </div>
    );
  }

  // Render appropriate question component based on type
  if (isWeekendClinic) {
    return (
      <div className="relative">
        <RefreshButton />
        <WeekendClinicQuestion
          questionNumber={questionNumber}
          content={cleanedContent}
          originalText={originalText || ''}
        />
      </div>
    );
  }

  if (isTrueFalse) {
    return (
      <div className="relative">
        <RefreshButton />
        <TrueFalseQuestion
          questionNumber={questionNumber}
          questionPart={questionPart}
          answerPart={answerPart}
        />
      </div>
    );
  }

  if (isSummaryBlank) {
    return (
      <div className="relative">
        <RefreshButton />
        <SummaryBlankQuestion
          questionNumber={questionNumber}
          questionPart={questionPart}
          answerPart={answerPart}
        />
      </div>
    );
  }

  if (isOrderWriting) {
    return (
      <div className="relative">
        <RefreshButton />
        <OrderWritingQuestion
          questionNumber={questionNumber}
          questionPart={questionPart}
          answerPart={answerPart}
        />
      </div>
    );
  }

  if (isConditionWriting) {
    return (
      <div className="relative">
        <RefreshButton />
        <ConditionWritingQuestion
          questionNumber={questionNumber}
          questionPart={questionPart}
          answerPart={answerPart}
        />
      </div>
    );
  }

  // Default question component for other types
  return (
    <div className="relative">
      <RefreshButton />
      <DefaultQuestion
        questionNumber={questionNumber}
        questionPart={questionPart}
        answerPart={answerPart}
        showVocabButton={showVocabButton}
        isVocabModalOpen={isVocabModalOpen}
        setIsVocabModalOpen={setIsVocabModalOpen}
      />
    </div>
  );
};
