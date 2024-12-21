import { QuestionType } from "@/types/question";
import { getQuestionTypes } from "@/lib/claude";
import { ScrollArea } from "./ui/scroll-area";

interface TypeSelectorProps {
  selectedType: QuestionType | null;
  onSelect: (type: QuestionType) => void;
}

export const TypeSelector = ({ selectedType, onSelect }: TypeSelectorProps) => {
  const types = getQuestionTypes();
  const suneungTypes = types.slice(0, 15);
  const schoolTypes = types.slice(15, 22);
  const descriptiveTypes = types.slice(22);

  const CategoryTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-lg font-semibold text-primary/80 py-2">
      {children}
    </h3>
  );

  const TypeButton = ({ type }: { type: QuestionType }) => (
    <button
      key={type.id}
      onClick={() => onSelect(type)}
      className={`type-button w-full text-left ${
        selectedType?.id === type.id ? "selected" : ""
      }`}
    >
      <span className="relative z-10">{type.name}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-3">
        <span className="text-3xl">✨</span> Question Types
      </h2>
      
      <ScrollArea className="h-[70vh] pr-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <CategoryTitle>수능형</CategoryTitle>
            <div className="grid gap-2">
              {suneungTypes.map((type) => (
                <TypeButton key={type.id} type={type} />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <CategoryTitle>학교별 시그니처</CategoryTitle>
            <div className="grid gap-2">
              {schoolTypes.map((type) => (
                <TypeButton key={type.id} type={type} />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <CategoryTitle>서술형</CategoryTitle>
            <div className="grid gap-2">
              {descriptiveTypes.map((type) => (
                <TypeButton key={type.id} type={type} />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};