
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  onStopGeneration?: () => void;
}

export const GenerateButton = ({ onClick, isLoading, onStopGeneration }: GenerateButtonProps) => {
  const handleClick = () => {
    if (isLoading && onStopGeneration) {
      onStopGeneration();
    } else {
      onClick();
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="flex-1 relative group overflow-hidden transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-2xl rounded-xl h-12 bg-transparent border-0"
    >
      {/* Base gradient background - changes to red when loading */}
      <div className={`absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity ${
        isLoading 
          ? 'bg-gradient-to-r from-[#EF4444] via-[#F87171] to-[#DC2626]' 
          : 'bg-gradient-to-r from-[#FFC73C] via-[#FFDE59] to-[#FFB81C]'
      }`}></div>
      
      {/* Subtle glass effect overlay */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        isLoading
          ? 'bg-[radial-gradient(circle_at_50%_120%,rgba(254,202,202,0.5),transparent_70%)]'
          : 'bg-[radial-gradient(circle_at_50%_120%,rgba(254,247,205,0.5),transparent_70%)]'
      }`}></div>
      
      {/* Light sweep animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
      
      {/* Button border glow effect - changes color based on state */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-border-flow`}
        style={{ 
          border: isLoading ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 199, 44, 0.5)',
          boxShadow: isLoading ? '0 0 15px rgba(239, 68, 68, 0.5)' : '0 0 15px rgba(255, 199, 44, 0.5)'
        }}
      ></div>
      
      {/* Button content */}
      <div className="relative flex items-center justify-center gap-2 text-white font-medium tracking-wide">
        {isLoading ? (
          <X className="w-5 h-5 animate-[pulse_1.5s_infinite]" />
        ) : (
          <Sparkles className="w-5 h-5 animate-[pulse_1.5s_infinite]" />
        )}
        <span className="text-base bg-gradient-to-r from-black to-[#000000] bg-clip-text text-transparent animate-text-shine group-hover:from-black group-hover:to-black excel-program-font">
          {isLoading ? "생성 중단 하기" : "문제 생성하기"}
        </span>
      </div>
    </Button>
  );
};
