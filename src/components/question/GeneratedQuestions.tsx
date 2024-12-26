import { GeneratedQuestion } from "../GeneratedQuestion";
import { VocabularyListModal } from "../VocabularyListModal";

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
  const sortedQuestions = [...questions].sort((a, b) => {
    if (!a.content && !b.content) return 0;
    if (!a.content) return 1;
    if (!b.content) return -1;
    return a.questionNumber - b.questionNumber;
  });

  const displayQuestions = sortedQuestions.map((question, index) => ({
    ...question,
    questionNumber: index + 1
  }));

  const allContent = displayQuestions.map(q => q.content).join('\n');

  return (
    <div className="space-y-6 bg-[#F8F7FF] p-6 rounded-lg border border-[#D6BCFA]/30">
      {displayQuestions.map((question) => (
        <GeneratedQuestion 
          key={question.id}
          content={question.content}
          questionNumber={question.questionNumber}
          originalText={question.originalText}
        />
      ))}
      
      {displayQuestions.length > 0 && (
        <div className="flex justify-center pt-6 mt-8 border-t border-[#D6BCFA]/30">
          <VocabularyListModal content={allContent} />
        </div>
      )}
    </div>
  );
};