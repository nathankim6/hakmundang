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
      window.open("https://chatgpt.com/gpts/editor/g-6779efe1a5ac819192283bbdb41de569", "_blank");
      return;
    }
    if (type.id === "sungReference") {
      window.open("https://chatgpt.com/gpts/editor/g-6779f42e26208191bcbfffeedd80d875", "_blank");
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
    if (type.id === "sungnamVocab2") {
      window.open("https://chatgpt.com/g/g-pjnh7FMaA-sungyiyeogo-yemun/c/6779eeb6-c030-8000-8deb-46cee384031a", "_blank");
      return;
    }
    if (type.id === "topicWriting") {
      window.open("https://chatgpt.com/g/g-6779ef32ec3c8191845ee7aae1b2e827-seodabhyeong-jujemun/c/6779ef4c-2440-8000-a8dc-506ecc2c9eb1", "_blank");
      return;
    }
    if (type.id === "orderWriting") {
      window.open("https://chatgpt.com/gpts/editor/g-6779f097fc348191acb04db248fc7fce", "_blank");
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
        {!isSelected && hasAccess && type.id !== "dangDict" && type.id !== "summaryBlank" && type.id !== "sungReference" && type.id !== "sungExternal" && type.id !== "sungnamVocab1" && type.id !== "sungnamVocab2" && type.id !== "topicWriting" && type.id !== "orderWriting" && (
          <Sparkles 
            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ filter: 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.5))' }}
          />
        )}
        {isSelected && hasAccess && type.id !== "dangDict" && type.id !== "summaryBlank" && type.id !== "sungReference" && type.id !== "sungExternal" && type.id !== "sungnamVocab1" && type.id !== "sungnamVocab2" && type.id !== "topicWriting" && type.id !== "orderWriting" && (
          <Check className="w-4 h-4 text-[#0EA5E9] animate-bounce" />
        )}
        <span className="flex-1">{type.name}</span>
      </span>
    </button>
  );
};