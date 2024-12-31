import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface ActionButtonsProps {
  onGenerate: () => void;
  onDownload: () => void;
  isLoading: boolean;
}

export const ActionButtons = ({ onGenerate, isLoading }: ActionButtonsProps) => {
  return (
    <div className="flex justify-center w-full">
      <Button
        onClick={onGenerate}
        disabled={isLoading}
        className="max-w-md w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] relative group overflow-hidden transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <div className="relative flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="font-semibold tracking-wide">
            {isLoading ? "문제 생성 중..." : "문제 생성하기"}
          </span>
        </div>
      </Button>
    </div>
  );
};