import { GeneratedQuestion } from "../GeneratedQuestion";
import { Button } from "@/components/ui/button";
import { Book, FileDown } from "lucide-react";
import { useState } from "react";
import { VocabularyModal } from "../VocabularyModal";

interface Question {
  id: string;
  content: string;
  questionNumber: number;
  originalText?: string;
}

interface GeneratedQuestionsProps {
  questions: Question[];
}

export const GeneratedQuestions = ({ questions }: GeneratedQuestionsProps) => {
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

  const handleSaveToTxt = () => {
    const questionsText: string[] = [];
    const answersText: string[] = [];

    sortedQuestions.forEach((question, index) => {
      const content = question.content;
      const parts = content.split('[정답]');
      
      if (parts.length > 1) {
        // Add question part
        questionsText.push(`문제 ${index + 1}\n${parts[0].trim()}\n`);
        
        // Process answer part while preserving format
        let answerPart = parts[1].trim();
        
        // Replace explanation sections with [해설] tag
        answerPart = answerPart
          .replace(/2\s*정답\s*설명/, '[해설]')
          .replace(/3\.\s*오답\s*설명/, '')
          .replace(/\[해설\].*?\[해설\]/g, '[해설]')
          .trim();
        
        // Add [정답] prefix if not present
        if (!answerPart.startsWith('[정답]')) {
          answerPart = `[정답] ${answerPart}`;
        }
        
        // Add to answers text while preserving format
        answersText.push(`문제 ${index + 1}\n${answerPart}\n`);
      } else {
        // If no [정답] separator found, add entire content to questions
        questionsText.push(`문제 ${index + 1}\n${content.trim()}\n`);
      }
    });

    // Combine questions and answers with a separator
    const combinedText = [
      "===== 문제 =====\n",
      questionsText.join('\n'),
      "\n===== 정답 =====\n",
      answersText.join('\n')
    ].join('');

    // Create and download file
    const blob = new Blob([combinedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '문제와정답.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        />
      ))}

      {sortedQuestions.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleSaveToTxt}
            variant="outline"
            className="max-w-md w-full relative group overflow-hidden transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl border-[#9b87f5]/30 hover:border-[#9b87f5]/50"
          >
            <div className="relative flex items-center justify-center gap-2">
              <FileDown className="w-5 h-5" />
              <span className="font-semibold tracking-wide">
                문제 저장하기
              </span>
            </div>
          </Button>
        </div>
      )}
      
      <VocabularyModal
        isOpen={isVocabModalOpen}
        onClose={() => setIsVocabModalOpen(false)}
        content={getAllVocabularyContent()}
      />
    </div>
  );
};