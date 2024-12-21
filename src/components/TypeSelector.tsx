import { QuestionType } from "@/types/question";
import { getQuestionTypes } from "@/lib/claude";

interface TypeSelectorProps {
  selectedType: QuestionType | null;
  onSelect: (type: QuestionType) => void;
}

export const TypeSelector = ({ selectedType, onSelect }: TypeSelectorProps) => {
  const types = getQuestionTypes();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary animate-title flex items-center gap-3">
        <span className="text-3xl">✨</span> Question Types
      </h2>
      <div className="grid grid-cols-1 gap-3 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type)}
            className={`type-button font-medium tracking-wide ${
              selectedType?.id === type.id ? "selected" : ""
            }`}
          >
            {type.name}
          </button>
        ))}
      </div>
    </div>
  );
};