
import { GeneratedQuestion } from "../GeneratedQuestion";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";
import { useState } from "react";
import { VocabularyModal } from "../VocabularyModal";
import { DownloadButton } from "./DownloadButton";

interface Question {
  id: string;
  content: string;
  questionNumber: number;
  originalText?: string;
  type?: string;
}

interface GeneratedQuestionsProps {
  questions: Question[];
  onRefresh?: (questionId: string, newContent: string) => void;
}

export const GeneratedQuestions = ({ questions, onRefresh }: GeneratedQuestionsProps) => {
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  
  const sortedQuestions = [...questions].sort((a, b) => {
    if (!a.content && !b.content) return 0;
    if (!a.content) return 1;
    if (!b.content) return -1;
    return a.questionNumber - b.questionNumber;
  });

  const getAllVocabularyContent = () => {
    const vocabQuestions = sortedQuestions
      .filter(question => 
        question.content.includes('| 표제어 |') || 
        question.content.includes('동의어') || 
        question.content.includes('반의어') ||
        question.content.includes('vocabulary')
      )
      .map((question, index) => {
        const content = question.content;
        const tableStart = content.indexOf('|');
        const tableContent = tableStart !== -1 ? content.substring(tableStart) : content;
        return `문제 ${index + 1}\n${tableContent}`;
      });

    return vocabQuestions.join('\n\n');
  };

  const handleRefresh = (questionId: string, newContent: string) => {
    if (onRefresh) {
      onRefresh(questionId, newContent);
    }
  };

  return (
    <div className="space-y-0 bg-[#F8F7FF] p-6 rounded-lg border border-[#D6BCFA]/30">
      {sortedQuestions.map((question, index) => (
        <GeneratedQuestion 
          key={question.id}
          content={question.content}
          questionNumber={index + 1}
          originalText={question.originalText}
          showVocabButton={false}
          onRefresh={(newContent) => handleRefresh(question.id, newContent)}
          questionType={question.type}
        />
      ))}

      {sortedQuestions.length > 0 && (
        <DownloadButton questions={sortedQuestions} />
      )}
      
      <VocabularyModal
        isOpen={isVocabModalOpen}
        onClose={() => setIsVocabModalOpen(false)}
        content={getAllVocabularyContent()}
      />
    </div>
  );
};
