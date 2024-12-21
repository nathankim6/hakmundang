import { QuestionType } from "@/types/question";
import { getQuestionTypes } from "@/lib/claude";

interface TypeSelectorProps {
  selectedType: QuestionType | null;
  onSelect: (type: QuestionType) => void;
}

export const TypeSelector = ({ selectedType, onSelect }: TypeSelectorProps) => {
  const types = getQuestionTypes();

  // Group questions by category
  const suneungTypes = types.slice(0, 15);  // 수능형
  const schoolTypes = types.slice(15, 22);   // 학교별 시그니처
  const descriptiveTypes = types.slice(22);  // 서술형

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary animate-title flex items-center gap-3">
        <span className="text-3xl">✨</span> Question Types
      </h2>
      <div className="grid grid-cols-1 gap-3 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {/* 수능형 */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-primary/80">수능형</h3>
          {suneungTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelect(type)}
              className={`type-button font-medium tracking-wide w-full text-left ${
                selectedType?.id === type.id ? "selected" : ""
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* 학교별 시그니처 */}
        <div className="space-y-2 mt-6">
          <h3 className="text-lg font-semibold text-primary/80">학교별 시그니처</h3>
          {schoolTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelect(type)}
              className={`type-button font-medium tracking-wide w-full text-left ${
                selectedType?.id === type.id ? "selected" : ""
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* 서술형 */}
        <div className="space-y-2 mt-6">
          <h3 className="text-lg font-semibold text-primary/80">서술형</h3>
          {descriptiveTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelect(type)}
              className={`type-button font-medium tracking-wide w-full text-left ${
                selectedType?.id === type.id ? "selected" : ""
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};