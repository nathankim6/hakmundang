import { QuestionType } from "@/types/question";
import { getQuestionTypes } from "@/lib/claude";
import { Check, Sparkles } from "lucide-react";

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
    const isSungui = type.name.includes("숭의여고");
    const isSungnam = type.name.includes("성남고");
    const isDanggok = type.name.includes("당곡고");
    
    return (
      <button
        key={type.id}
        onClick={() => isSelected ? onRemove(type.id) : onSelect(type)}
        className={`type-button group relative w-full text-left transition-all duration-300 hover:scale-[1.02] ${
          isSelected 
            ? "selected bg-[#0EA5E9]/20 text-[#1A1F2C] font-semibold shadow-md" 
            : "hover:bg-[#D3E4FD] hover:text-[#0EA5E9]"
        }`}
      >
        <span className="relative z-10 flex items-center justify-between gap-2">
          {!isSelected && (
            <Sparkles 
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ filter: 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.5))' }}
            />
          )}
          {isSungui && (
            <img 
              src="/lovable-uploads/463ace92-8cb3-402e-9a22-852f579f8c25.png"
              alt="Sungui Girls' High School Logo"
              className="w-5 h-5 object-contain"
            />
          )}
          {isSungnam && (
            <img 
              src="/lovable-uploads/46cde7ad-f85a-405a-867c-665d2764ed71.png"
              alt="Sungnam High School Logo"
              className="w-5 h-5 object-contain"
            />
          )}
          {isDanggok && (
            <img 
              src="/lovable-uploads/51f83aca-e232-429f-a8cf-b0faea121ab0.png"
              alt="Danggok High School Logo"
              className="w-5 h-5 object-contain"
            />
          )}
          <span className="flex-1">{type.name}</span>
          {isSelected && (
            <Check className="w-4 h-4 text-[#0EA5E9] animate-bounce" />
          )}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer" />
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1A1F2C] flex items-center gap-3 whitespace-nowrap">
        <Sparkles className="w-6 h-6 text-[#FFD700] animate-pulse" />
        Question Types
      </h2>
      
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
          <CategoryTitle>옳은영어 전용</CategoryTitle>
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