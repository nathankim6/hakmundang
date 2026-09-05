
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
    <div className="space-y-4">
      <div className="space-y-0 bg-gradient-to-br from-[#F8F7FF] via-[#FEFBFF] to-[#F3F0FF] p-6 rounded-lg border border-[#D6BCFA]/30 relative overflow-hidden">
        {/* Background animation for loading state */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/20 to-transparent opacity-0 animate-pulse" />
        
        {sortedQuestions.map((question, index) => {
          const isLoading = !question.content || question.content.trim() === '';
          
          return (
            <div key={question.id} className="relative">
              {/* Dynamic loading effect for each question */}
              {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-indigo-50/50 to-purple-50/30 rounded-lg animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[slide-in-right_2s_ease-in-out_infinite]" />
                  <div className="flex items-center justify-center h-32">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              
              <div className={`transition-all duration-500 ${isLoading ? 'opacity-30 scale-98' : 'opacity-100 scale-100 animate-fade-in'}`}>
                <GeneratedQuestion 
                  content={question.content}
                  questionNumber={index + 1}
                  originalText={question.originalText}
                  showVocabButton={false}
                  onRefresh={(newContent) => handleRefresh(question.id, newContent)}
                  questionType={question.type}
                />
              </div>
            </div>
          );
        })}
      </div>

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
