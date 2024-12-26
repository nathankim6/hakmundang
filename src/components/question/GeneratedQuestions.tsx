import { GeneratedQuestion } from "../GeneratedQuestion";
import { SynonymAntonymEditor } from "../SynonymAntonymEditor";
import { VocabularyListModal } from "../vocabulary/VocabularyListModal";

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
  // Sort questions by their content to maintain consistency
  const sortedQuestions = [...questions].sort((a, b) => {
    if (!a.content && !b.content) return 0;
    if (!a.content) return 1;
    if (!b.content) return -1;
    return a.questionNumber - b.questionNumber;
  });

  // Reassign sequential numbers
  const displayQuestions = sortedQuestions.map((question, index) => ({
    ...question,
    questionNumber: index + 1
  }));

  // Check if any questions are synonym/antonym type
  const hasSynonymAntonymQuestions = displayQuestions.some(q => 
    q.content.includes('| 표제어 | 표제어뜻 | 동의어 | 동의어뜻 | 반의어 | 반의어뜻 |')
  );

  return (
    <div className="space-y-4 bg-[#F8F7FF] p-6 rounded-lg border border-[#D6BCFA]/30">
      {hasSynonymAntonymQuestions && (
        <div className="mb-4">
          <SynonymAntonymEditor questions={displayQuestions} />
        </div>
      )}
      
      {displayQuestions.map((question) => (
        <GeneratedQuestion 
          key={question.id}
          content={question.content}
          questionNumber={question.questionNumber}
          originalText={question.originalText}
        />
      ))}

      {hasSynonymAntonymQuestions && (
        <div className="mt-8">
          <VocabularyListModal questions={displayQuestions} />
        </div>
      )}
    </div>
  );
};