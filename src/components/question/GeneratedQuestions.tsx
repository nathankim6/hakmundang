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
  
  // Sort questions by their content to maintain consistency
  const sortedQuestions = [...questions].sort((a, b) => {
    if (!a.content && !b.content) return 0;
    if (!a.content) return 1;
    if (!b.content) return -1;
    return a.questionNumber - b.questionNumber;
  });

  // Check if any questions are vocabulary or synonym/antonym type
  const hasVocabulary = sortedQuestions.some(
    question => question.content.includes('| 표제어 |') || 
                question.content.includes('동의어') || 
                question.content.includes('반의어') ||
                question.content.includes('vocabulary')
  );

  // Combine all vocabulary content with question numbers
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
    // Separate questions and answers
    const questionsText: string[] = [];
    const answersText: string[] = [];

    sortedQuestions.forEach((question, index) => {
      const content = question.content;
      const parts = content.split('[정답]');
      
      if (parts.length > 1) {
        // Add question number and question part
        questionsText.push(`문제 ${index + 1}\n${parts[0].trim()}\n`);
        // Add answer number and answer part (simplified title)
        answersText.push(`문제 ${index + 1}\n${parts[1].trim()}\n`);
      } else {
        // If no [정답] separator found, add entire content to questions
        questionsText.push(`문제 ${index + 1}\n${content.trim()}\n`);
      }
    });

    // Create and download questions file
    const questionsBlob = new Blob([questionsText.join('\n')], { type: 'text/plain;charset=utf-8' });
    const questionsUrl = URL.createObjectURL(questionsBlob);
    const questionsLink = document.createElement('a');
    questionsLink.href = questionsUrl;
    questionsLink.download = '문제.txt';
    document.body.appendChild(questionsLink);
    questionsLink.click();
    document.body.removeChild(questionsLink);

    // Create and download answers file
    const answersBlob = new Blob([answersText.join('\n')], { type: 'text/plain;charset=utf-8' });
    const answersUrl = URL.createObjectURL(answersBlob);
    const answersLink = document.createElement('a');
    answersLink.href = answersUrl;
    answersLink.download = '정답.txt';
    document.body.appendChild(answersLink);
    answersLink.click();
    document.body.removeChild(answersLink);
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
      
      {hasVocabulary && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={() => setIsVocabModalOpen(true)}
            className="text-[#9b87f5] hover:text-[#7E69AB] border-[#9b87f5] hover:border-[#7E69AB]"
          >
            <Book className="w-4 h-4 mr-2" />
            단어장 생성
          </Button>
        </div>
      )}

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