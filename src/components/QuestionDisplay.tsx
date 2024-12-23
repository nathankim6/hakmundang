import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

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

export const QuestionDisplay = ({ question, type, onDelete }: QuestionDisplayProps) => {
  return (
    <Card className="p-6 space-y-4 relative bg-white shadow-md rounded-lg border border-gray-200">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        onClick={onDelete}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">문제</h3>
          <p className="mt-1 text-gray-700 whitespace-pre-wrap">{question.question}</p>
        </div>

        {type === "객관식" && question.options && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">보기</h4>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50"
                >
                  <span className="font-medium text-gray-700">
                    {index + 1}.
                  </span>
                  <span className="text-gray-600">{option}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="font-medium text-gray-900">정답</h4>
          <p className="mt-1 text-emerald-600 font-medium">{question.answer}</p>
        </div>

        {question.explanation && (
          <div>
            <h4 className="font-medium text-gray-900">해설</h4>
            <p className="mt-1 text-gray-600 whitespace-pre-wrap">{question.explanation}</p>
          </div>
        )}
      </div>
    </Card>
  );
};