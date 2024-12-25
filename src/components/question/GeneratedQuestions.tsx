import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table } from "lucide-react";
import { SynonymTable } from "./SynonymTable";

interface GeneratedQuestionsProps {
  questions: {
    id: string;
    content: string;
    questionNumber: number;
  }[];
}

export const GeneratedQuestions = ({ questions }: GeneratedQuestionsProps) => {
  const [isTableOpen, setIsTableOpen] = useState(false);
  const hasSynonymQuestions = questions.some(q => q.content.includes("Word\tMeaning\tSynonyms/Antonyms"));

  if (questions.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#7E69AB]">생성된 문제</h2>
        {hasSynonymQuestions && (
          <Button
            variant="outline"
            onClick={() => setIsTableOpen(true)}
            className="gap-2"
          >
            <Table className="w-4 h-4" />
            동의어/반의어 표 보기
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="p-6 bg-white rounded-lg border-2 border-[#9b87f5]/20 space-y-4"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-[#7E69AB]">
                문제 {question.questionNumber || index + 1}
              </h3>
            </div>
            <div className="whitespace-pre-wrap">{question.content}</div>
          </div>
        ))}
      </div>

      <SynonymTable
        isOpen={isTableOpen}
        onClose={() => setIsTableOpen(false)}
        questions={questions.filter(q => q.content.includes("Word\tMeaning\tSynonyms/Antonyms"))}
      />
    </div>
  );
};