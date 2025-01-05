import { Check, Sparkles, Lock } from "lucide-react";
import { QuestionType } from "@/types/question";

interface TypeButtonProps {
  type: QuestionType;
  isSelected: boolean;
  hasAccess: boolean;
  onClick: () => void;
  logos: string[];
}

export const TypeButton = ({ type, isSelected, hasAccess, onClick, logos }: TypeButtonProps) => {
  const handleClick = () => {
    if (type.id === "dangDict") {
      window.open("https://chatgpt.com/g/g-675422c0793c81918b65a1a25e82e7a0-danggoggo-yeongyeongsajeon", "_blank");
      return;
    }
    if (type.id === "summaryBlank") {
      window.open("https://chatgpt.com/g/g-674ea64db4648191b245476ce685ed9d-danggoggo-seosulhyeong-yoyagmun-binkan/c/6779eca6-ca00-8000-bd70-d8fe3fba74e7", "_blank");
      return;
    }
    if (type.id === "sungReference") {
      window.open("https://chatgpt.com/gpts/editor/g-674a7a15d3348191b9ff6a9c1763a21a", "_blank");
      return;
    }
    if (type.id === "sungExternal") {
      window.open("https://chatgpt.com/gpts/editor/g-67498d63f1048191a987654ac0a2bd44", "_blank");
      return;
    }
    if (type.id === "sungnamVocab1") {
      window.open("https://chatgpt.com/g/g-rGMRYG1t6-sungyiyeogo-dongbanyieo/c/6779edff-5f3c-8000-812f-731f071bbb99", "_blank");
      return;
    }
    onClick();
  };

  return (
    <button
      key={type.id}
      onClick={handleClick}
      className={`type-button group relative w-full text-left transition-all duration-300 hover:scale-[1.02] ${
        !hasAccess 
          ? "opacity-50 cursor-not-allowed hover:scale-100"
          : isSelected 
            ? "selected bg-[#0EA5E9]/20 text-[#1A1F2C] font-semibold shadow-md" 
            : "hover:bg-[#D3E4FD] hover:text-[#0EA5E9]"
      }`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {logos.length > 0 && (
          <div className="flex -space-x-2">
            {logos.map((logo, index) => (
              <img 
                key={index}
                src={logo} 
                alt={`School logo ${index + 1}`} 
                className="w-6 h-6 object-contain rounded-full bg-white"
              />
            ))}
          </div>
        )}
        {!hasAccess && (
          <Lock 
            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          />
        )}
        {!isSelected && hasAccess && type.id !== "dangDict" && type.id !== "summaryBlank" && type.id !== "sungReference" && type.id !== "sungExternal" && type.id !== "sungnamVocab1" && (
          <Sparkles 
            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ filter: 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.5))' }}
          />
        )}
        {isSelected && hasAccess && type.id !== "dangDict" && type.id !== "summaryBlank" && type.id !== "sungReference" && type.id !== "sungExternal" && type.id !== "sungnamVocab1" && (
          <Check className="w-4 h-4 text-[#0EA5E9] animate-bounce" />
        )}
        <span className="flex-1">{type.name}</span>
      </span>
    </button>
  );
};