import { Check, Sparkles, Lock } from "lucide-react";
import { QuestionType } from "@/types/question";

interface TypeButtonProps {
  type: QuestionType;
  isSelected: boolean;
  hasAccess: boolean;
  onClick: () => void;
}

export const TypeButton = ({ type, isSelected, hasAccess, onClick }: TypeButtonProps) => {
  return (
    <button
      key={type.id}
      onClick={onClick}
      className={`type-button group relative w-full text-left transition-all duration-300 hover:scale-[1.02] ${
        !hasAccess 
          ? "opacity-50 cursor-not-allowed hover:scale-100"
          : isSelected 
            ? "selected bg-[#0EA5E9]/20 text-[#1A1F2C] font-semibold shadow-md" 
            : "hover:bg-[#D3E4FD] hover:text-[#0EA5E9]"
      }`}
    >
      <span className="relative z-10 flex items-center justify-between gap-2">
        {!hasAccess && (
          <Lock 
            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          />
        )}
        {!isSelected && hasAccess && (
          <Sparkles 
            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ filter: 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.5))' }}
          />
        )}
        {isSelected && (
          <div 
            className="absolute inset-0 bg-gradient-to-r from-[#0EA5E9]/10 via-[#0EA5E9]/5 to-transparent 
              animate-shimmer"
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
            }}
          />
        )}
        <span className="flex-1">{type.name}</span>
        {isSelected && hasAccess && (
          <Check className="w-4 h-4 text-[#0EA5E9] animate-bounce" />
        )}
      </span>
    </button>
  );
};