import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";
import { VocabularyModal } from "../VocabularyModal";

interface DefaultQuestionProps {
  questionNumber: number;
  questionPart: string;
  answerPart: string;
  showVocabButton?: boolean;
  isVocabModalOpen: boolean;
  setIsVocabModalOpen: (isOpen: boolean) => void;
}

export const DefaultQuestion = ({
  questionNumber,
  questionPart,
  answerPart,
  showVocabButton = true,
  isVocabModalOpen,
  setIsVocabModalOpen,
}: DefaultQuestionProps) => {
  const isGrammarQuestion = questionPart.includes('어법상') || questionPart.includes('[29] 어법');

  const formatGrammarText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/([①-⑤])/g, '<span class="text-primary">$1</span>');
  };

  return (
    <div className="py-6 first:pt-0 last:pb-0 border-b last:border-b-0 border-[#D6BCFA]/30">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-[#1A1F2C]">
            {questionNumber}번
          </h3>
          {showVocabButton && !isGrammarQuestion && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVocabModalOpen(true)}
              className="shrink-0"
            >
              <Book className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className={`space-y-4 text-[#4A5568] ${isGrammarQuestion ? 'grammar-question' : ''}`}>
          {/* Question Part */}
          <div className="whitespace-pre-wrap">
            {isGrammarQuestion ? (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: formatGrammarText(questionPart) 
                }} 
              />
            ) : (
              questionPart
            )}
          </div>

          {/* Answer Part */}
          {answerPart && (
            <div className="pt-4 border-t border-[#D6BCFA]/30">
              <p className="font-semibold text-[#1A1F2C] mb-2">정답</p>
              <div 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: isGrammarQuestion ? formatGrammarText(answerPart) : answerPart
                }}
              />
            </div>
          )}
        </div>
      </div>

      <VocabularyModal
        isOpen={isVocabModalOpen}
        onClose={() => setIsVocabModalOpen(false)}
        content={questionPart}
      />
    </div>
  );
};