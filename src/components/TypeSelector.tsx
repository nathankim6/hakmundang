import { QuestionType } from "@/types/question";
import { getQuestionTypes } from "@/lib/claude";
import { ScrollArea } from "./ui/scroll-area";
import { X } from "lucide-react";

interface TypeSelectorProps {
  selectedTypes: QuestionType[];
  onSelect: (type: QuestionType) => void;
  onRemove: (typeId: string) => void;
}

export const TypeSelector = ({ selectedTypes, onSelect, onRemove }: TypeSelectorProps) => {
  const types = getQuestionTypes();
  const suneungTypes = types.slice(0, 15);
  const schoolTypes = types.slice(15, 22);
  const descriptiveTypes = types.slice(22);

  const CategoryTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center justify-center mb-4">
      <h3 className="text-xl font-bold text-primary/90 py-2 px-6 rounded-full bg-secondary/50 shadow-sm">
        {children}
      </h3>
    </div>
  );

  const TypeButton = ({ type }: { type: QuestionType }) => {
    const isSelected = selectedTypes.some(t => t.id === type.id);
    
    return (
      <button
        key={type.id}
        onClick={() => isSelected ? onRemove(type.id) : onSelect(type)}
        className={`type-button w-full text-left ${isSelected ? "selected bg-primary/20 text-primary font-semibold shadow-md" : ""}`}
      >
        <span className="relative z-10 flex items-center justify-between">
          <span>{type.name}</span>
          {isSelected && <X className="w-4 h-4" />}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-3">
        <span className="text-3xl">✨</span> Question Types
      </h2>
      
      <ScrollArea className="h-[70vh] pr-4">
        <div className="space-y-8">
          <div className="space-y-4">
            <CategoryTitle>수능형</CategoryTitle>
            <div className="grid gap-2">
              {suneungTypes.map((type) => (
                <TypeButton key={type.id} type={type} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <CategoryTitle>학교별 시그니처</CategoryTitle>
            <div className="grid gap-2">
              {schoolTypes.map((type) => (
                <TypeButton key={type.id} type={type} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
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