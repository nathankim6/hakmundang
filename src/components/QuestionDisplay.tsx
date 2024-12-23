import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface QuestionDisplayProps {
  question: {
    question: string;
    options?: string[];
    answer?: string;
    explanation?: string;
  };
  type: string;
  onDelete: () => void;
}

export const QuestionDisplay = ({ question, type, onDelete }: QuestionDisplayProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{question.question}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-gray-500 hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {type === "객관식" && question.options && (
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50"
            >
              <span className="font-medium">{index + 1}.</span>
              <span>{option}</span>
            </div>
          ))}
        </div>
      )}

      {question.answer && (
        <div className="pt-4 border-t">
          <p className="font-semibold text-green-600">정답: {question.answer}</p>
        </div>
      )}

      {question.explanation && (
        <div className="pt-2">
          <p className="text-gray-600">
            <span className="font-semibold">해설:</span> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};