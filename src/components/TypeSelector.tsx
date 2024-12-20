import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionType } from "@/types/question";
import { getQuestionTypes } from "@/lib/claude";

interface TypeSelectorProps {
  selectedType: QuestionType | null;
  onSelect: (type: QuestionType) => void;
}

export const TypeSelector = ({ selectedType, onSelect }: TypeSelectorProps) => {
  const types = getQuestionTypes();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-primary animate-sparkle">문제 유형</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type)}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              selectedType?.id === type.id
                ? "border-primary bg-primary/20 text-primary"
                : "border-muted hover:border-primary/50 hover:bg-primary/10"
            }`}
          >
            {type.name}
          </button>
        ))}
      </div>
    </div>
  );
};