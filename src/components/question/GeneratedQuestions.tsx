import { GeneratedQuestion } from "../GeneratedQuestion";
import { Button } from "@/components/ui/button";
import { Book, Save } from "lucide-react";
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

  const hasVocabulary = sortedQuestions.some(
    question => question.content.includes('| 표제어 |') || 
                question.content.includes('동의어') || 
                question.content.includes('반의어') ||
                question.content.includes('vocabulary')
  );

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

    const vocabContent = vocabQuestions.join('\n\n');
    console.log('Vocabulary content:', vocabContent);
    return vocabContent;
  };

  const saveQuestionsToFile = () => {
    let questionsText = "";
    let answersText = "정답 및 해설\n\n";

    sortedQuestions.forEach((question, index) => {
      const questionNumber = index + 1;
      const content = question.content;

      // Split content into question and answer parts
      const parts = content.split('[정답]');
      const questionPart = parts[0].trim();
      const answerPart = parts.length > 1 ? parts[1].trim() : '';

      // Add question to questions text
      questionsText += `문제${questionNumber}\n`;
      if (question.originalText) {
        questionsText += `${question.originalText}\n\n`;
      }
      questionsText += `${questionPart}\n\n`;

      // Add answer to answers text
      answersText += `문제${questionNumber}\n`;
      answersText += `${answerPart}\n\n`;
    });

    // Create and download questions file
    const questionsBlob = new Blob([questionsText], { type: 'text/plain;charset=utf-8' });
    const questionsLink = document.createElement('a');
    questionsLink.href = URL.createObjectURL(questionsBlob);
    questionsLink.download = '문제.txt';
    questionsLink.click();

    // Create and download answers file
    const answersBlob = new Blob([answersText], { type: 'text/plain;charset=utf-8' });
    const answersLink = document.createElement('a');
    answersLink.href = URL.createObjectURL(answersBlob);
    answersLink.download = '정답및해설.txt';
    answersLink.click();
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
      
      {hasVocabulary ? (
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
      ) : (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={saveQuestionsToFile}
            className="text-[#9b87f5] hover:text-[#7E69AB] border-[#9b87f5] hover:border-[#7E69AB]"
          >
            <Save className="w-4 h-4 mr-2" />
            문제저장
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