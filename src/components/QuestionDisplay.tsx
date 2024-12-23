import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface QuestionDisplayProps {
  question: {
    question: string;
    options?: string[];
    answer: string;
    explanation?: string;
  };
  type: string;
  onDelete: () => void;
}

export function QuestionDisplay({ question, type, onDelete }: QuestionDisplayProps) {
  return (
    <Card className="p-6 space-y-4 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="space-y-2">
        <h3 className="font-semibold text-lg">문제</h3>
        <p className="text-gray-700">{question.question}</p>
      </div>

      {type === "객관식" && question.options && (
        <div className="space-y-2">
          <h3 className="font-semibold">보기</h3>
          <div className="space-y-1">
            {question.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
              >
                <span className="font-medium">{index + 1}.</span>
                <span>{option}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-semibold">정답</h3>
        <p className="text-gray-700">{question.answer}</p>
      </div>

      {question.explanation && (
        <div className="space-y-2">
          <h3 className="font-semibold">해설</h3>
          <p className="text-gray-700">{question.explanation}</p>
        </div>
      )}
    </Card>
  );
}