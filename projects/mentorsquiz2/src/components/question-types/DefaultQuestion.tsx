
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

  const formatTextWithSpacing = (text: string) => {
    // Add line spacing before options (①-⑤) and choices
    return text
      .replace(/\n([①-⑤])/g, '\n\n$1')
      .replace(/\n(1\.)/g, '\n\n$1')
      .replace(/\n(2\.)/g, '\n\n$1')
      .replace(/\n(3\.)/g, '\n\n$1')
      .replace(/\n(4\.)/g, '\n\n$1')
      .replace(/\n(5\.)/g, '\n\n$1')
      .replace(/\n(<보기>)/g, '\n\n$1')
      .replace(/\n(\[조건\])/g, '\n\n$1')
      .replace(/\n(\[문제\])/g, '\n\n$1')
      .replace(/\n(\[요약문\])/g, '\n\n$1');
  };

  // Clean out any [출력] or [OUTPUT] text that might be in the content
  const cleanQuestionPart = questionPart
    .replace(/\[출력\]\s*/g, '')
    .replace(/\[OUTPUT\]\s*/g, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();
    
  const cleanAnswerPart = answerPart
    .replace(/\[출력\]\s*/g, '')
    .replace(/\[OUTPUT\]\s*/g, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();

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
                  __html: formatGrammarText(cleanQuestionPart) 
                }} 
              />
            ) : (
              formatTextWithSpacing(cleanQuestionPart)
            )}
          </div>

          {/* Answer Part */}
          {cleanAnswerPart && (
            <div className="pt-4 border-t border-[#D6BCFA]/30">
              <p className="font-semibold text-[#1A1F2C] mb-2">정답</p>
              <div 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: isGrammarQuestion ? formatGrammarText(cleanAnswerPart) : formatTextWithSpacing(cleanAnswerPart)
                }}
              />
            </div>
          )}
        </div>
      </div>

      <VocabularyModal
        isOpen={isVocabModalOpen}
        onClose={() => setIsVocabModalOpen(false)}
        content={cleanQuestionPart}
      />
    </div>
  );
};
