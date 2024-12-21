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
      <h2 className="text-xl font-bold text-primary animate-sparkle flex items-center gap-2">
        <span className="text-2xl">👑</span> Question Types
      </h2>
      <div className="grid grid-cols-1 gap-2 max-h-[70vh] overflow-y-auto pr-2">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type)}
            className={`p-4 rounded-lg transition-all duration-300 text-left metallic-border ${
              selectedType?.id === type.id
                ? "border-primary bg-primary/20 text-primary shadow-lg"
                : "hover:border-primary/50 hover:bg-primary/10"
            }`}
          >
            <span className="font-medium tracking-wide">{type.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};