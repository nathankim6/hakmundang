import { QuestionType } from "@/types/question";
import { getQuestionTypes } from "@/lib/claude";
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
  const descriptiveTypes = types.slice(22, 28);
  const contentTypes = types.slice(28);

  const CategoryTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center justify-center mb-4">
      <h3 className="text-xl font-bold text-[#0EA5E9] py-2 px-6 rounded-full bg-[#D3E4FD] shadow-sm">
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
        className={`type-button w-full text-left ${
          isSelected 
            ? "selected bg-[#0EA5E9]/20 text-[#1A1F2C] font-semibold shadow-md" 
            : "hover:bg-[#D3E4FD] hover:text-[#0EA5E9]"
        }`}
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
      <h2 className="text-2xl font-bold text-[#1A1F2C] flex items-center gap-3 whitespace-nowrap">✨ Question Types</h2>
      
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
          <CategoryTitle>내신형</CategoryTitle>
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

        <div className="space-y-4">
          <CategoryTitle>옳은영어 콘텐츠</CategoryTitle>
          <div className="grid gap-2">
            {contentTypes.map((type) => (
              <TypeButton key={type.id} type={type} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};