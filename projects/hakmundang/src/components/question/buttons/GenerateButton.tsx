import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const GenerateButton = ({ onClick, isLoading }: GenerateButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className="flex-1 relative group overflow-hidden transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed rounded-xl h-12 bg-transparent border-0"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-500 opacity-90 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      <div className="relative flex items-center justify-center gap-2 text-white font-medium tracking-wide">
        <Sparkles className="w-5 h-5 animate-[pulse_2s_infinite]" />
        <span className="text-base">
          {isLoading ? "문제 생성 중..." : "문제 생성하기"}
        </span>
      </div>
    </Button>
  );
};