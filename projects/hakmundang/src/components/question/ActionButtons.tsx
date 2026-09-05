
import { useState, useEffect } from "react";
import { useQuestionContext } from "./QuestionContext";
import { useToast } from "@/hooks/use-toast";
import { DifficultySelector } from "./difficulty-selector/DifficultySelector";
import { GenerateButton } from "./buttons/GenerateButton";
import { ClearButton } from "./buttons/ClearButton";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

interface ActionButtonsProps {
  onGenerate: () => void;
  isLoading: boolean;
  difficulty?: string;
  onDifficultyChange?: (level: string) => void;
  onStopGeneration?: () => void;
  handleDownloadDoc?: () => void;
}

export const ActionButtons = ({ 
  onGenerate, 
  isLoading, 
  difficulty = "1",
  onDifficultyChange,
  onStopGeneration,
  handleDownloadDoc
}: ActionButtonsProps) => {
  const [localDifficulty, setLocalDifficulty] = useState(difficulty);
  const { selectedTypes, onRemoveType } = useQuestionContext();
  const { toast } = useToast();

  useEffect(() => {
    setLocalDifficulty(difficulty);
  }, [difficulty]);

  const handleClearAll = () => {
    // Stop generation if in progress
    if (isLoading && onStopGeneration) {
      onStopGeneration();
    }
    
    // Clear all types
    selectedTypes.forEach(typeEntry => {
      onRemoveType(typeEntry.type.id);
    });
    
    toast({
      title: "초기화 완료",
      description: "모든 문제 유형과 생성된 문제가 삭제되었습니다.",
    });
  };

  const handleSliderChange = (value: number[]) => {
    const newDifficulty = String(value[0]) as "1" | "2" | "3";
    setLocalDifficulty(newDifficulty);
    onDifficultyChange?.(newDifficulty);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-[#1A1F2C] to-[#2A2F3C] rounded-xl border border-[#D6BCFA]/40 space-y-5 shadow-lg relative overflow-hidden group hover:border-[#9b87f5]/60 transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 bg-[#1A1F2C] py-3 px-4 border-b border-[#D6BCFA]/20">
          <h3 className="text-center text-white/90 font-semibold">난이도 설정</h3>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-[#9b87f5]/10 to-[#D6BCFA]/5 opacity-40 animate-gradient"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(155,135,245,0.1),transparent_70%)] mix-blend-overlay"></div>
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        
        <div className="space-y-6 px-2 relative z-10 pt-8">
          <DifficultySelector
            localDifficulty={localDifficulty}
            onDifficultyChange={handleSliderChange}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <GenerateButton
          onClick={onGenerate}
          isLoading={isLoading}
        />
        <ClearButton onClick={handleClearAll} />
      </div>
    </div>
  );
};
