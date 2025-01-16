import { Check, Sparkles, Lock, ExternalLink } from "lucide-react";
import { QuestionType } from "@/types/question";
import { cn } from "@/lib/utils";

interface TypeButtonProps {
  type: QuestionType;
  isSelected: boolean;
  hasAccess: boolean;
  onClick: () => void;
  logos: string[];
}

export const TypeButton = ({ type, isSelected, hasAccess, onClick, logos }: TypeButtonProps) => {
  const handleClick = () => {
    if (!hasAccess) return;
    
    if (type.id === "dangDict") {
      window.open("https://chatgpt.com/g/g-675422c0793c81918b65a1a25e82e7a0-danggoggo-yeongyeongsajeon", "_blank");
      return;
    }
    if (type.id === "summaryBlank") {
      window.open("https://chatgpt.com/g/g-6779efe1a5ac819192283bbdb41de569-seodabhyeong-yoyagmun-binkan", "_blank");
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
      window.open("https://chatgpt.com/g/g-6779f097fc348191acb04db248fc7fce-seodabhyeong-baeyeolyeongjag", "_blank");
      return;
    }
    if (type.id === "illustration") {
      window.open("https://chatgpt.com/g/g-6788fbdfbec881918b83bf702be929c3-sabhwajejaggi", "_blank");
      return;
    }
    onClick();
  };

  const isGptLink = ["dangDict", "summaryBlank", "sungReference", "sungExternal", "sungnamVocab1", "sungnamVocab2", "topicWriting", "orderWriting", "illustration"].includes(type.id);

  return (
    <button
      key={type.id}
      onClick={handleClick}
      className={cn(
        "group relative w-full text-left transition-all duration-300",
        "px-4 py-3 rounded-lg overflow-hidden",
        "bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-sm",
        "border border-transparent",
        "shadow-sm",
        "transform hover:-translate-y-0.5 active:translate-y-0",
        hasAccess ? (
          isSelected ? 
            "bg-gradient-to-r from-[#FDE1D3] to-[#FEC6A1] shadow-lg" : 
            "hover:scale-[1.01] hover:bg-gradient-to-r hover:from-[#FEF7CD] hover:to-white"
        ) : "cursor-not-allowed opacity-50",
        isSelected && hasAccess && [
          "border-[#FEC6A1]/20",
          "shadow-[0_2px_15px_-2px_rgba(254,198,161,0.4)]",
        ],
        !isSelected && hasAccess && "hover:border-[#FEF7CD]/20 hover:shadow-[0_4px_12px_-4px_rgba(254,247,205,0.3)]"
      )}
    >
      <div className="relative z-10 flex items-center gap-2">
        {logos.length > 0 && (
          <div className="flex -space-x-2">
            {logos.map((logo, index) => (
              <img 
                key={index}
                src={logo} 
                alt={`School logo ${index + 1}`} 
                className={cn(
                  "w-6 h-6 object-contain rounded-full bg-white/90 p-0.5",
                  "shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)]",
                  "transition-all duration-300",
                  "group-hover:scale-105"
                )}
              />
            ))}
          </div>
        )}
        {!hasAccess && (
          <Lock 
            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          />
        )}
        {!isSelected && hasAccess && !isGptLink && (
          <Sparkles 
            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FEC6A1] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ filter: 'drop-shadow(0 0 4px rgba(254,198,161,0.7))' }}
          />
        )}
        {isSelected && hasAccess && !isGptLink && (
          <Check className="w-4 h-4 text-[#1A1F2C]" />
        )}
        <span className={cn(
          "flex-1 font-medium",
          "transition-all duration-300",
          isSelected ? "text-[#1A1F2C] font-bold" : "text-[#1A1F2C]",
          "group-hover:text-[#1A1F2C]"
        )}>
          {type.name}
        </span>
        {isGptLink && (
          <ExternalLink 
            className={cn(
              "w-4 h-4 text-[#1A1F2C]/90",
              "transition-all duration-300",
              "group-hover:scale-105"
            )}
          />
        )}
      </div>
      <div className={cn(
        "absolute inset-0 rounded-lg",
        "bg-gradient-to-r from-transparent via-white/10 to-transparent",
        "opacity-0 group-hover:opacity-100",
        "transition-opacity duration-300",
        isSelected && "opacity-100"
      )} />
    </button>
  );
};