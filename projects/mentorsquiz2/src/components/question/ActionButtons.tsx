import { useState, useEffect } from "react";
import { useQuestionContext } from "./QuestionContext";
import { useToast } from "@/hooks/use-toast";
import { DifficultySelector } from "./difficulty-selector/DifficultySelector";
import { GenerateButton } from "./buttons/GenerateButton";
import { ClearButton } from "./buttons/ClearButton";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { LoadingProgress } from "../LoadingProgress";
interface ActionButtonsProps {
  onGenerate: () => void;
  isLoading: boolean;
  difficulty?: string;
  onDifficultyChange?: (level: string) => void;
  complexity?: string;
  onComplexityChange?: (level: string) => void;
  onStopGeneration?: () => void;
  handleDownloadDoc?: () => void;
  progress?: {
    current: number;
    total: number;
  };
}
export const ActionButtons = ({
  onGenerate,
  isLoading,
  difficulty = "1",
  onDifficultyChange,
  complexity = "수능",
  onComplexityChange,
  onStopGeneration,
  handleDownloadDoc,
  progress
}: ActionButtonsProps) => {
  const [localDifficulty, setLocalDifficulty] = useState(difficulty);
  const [localComplexity, setLocalComplexity] = useState(complexity);
  const {
    selectedTypes,
    onRemoveType
  } = useQuestionContext();
  const {
    toast
  } = useToast();
  const [hasHancomApiKey, setHasHancomApiKey] = useState(false);
  useEffect(() => {
    setLocalDifficulty(difficulty);
  }, [difficulty]);
  useEffect(() => {
    setLocalComplexity(complexity);
  }, [complexity]);
  useEffect(() => {
    // Check if Hancom API key exists
    const apiKey = localStorage.getItem("hancom_api_key");
    setHasHancomApiKey(!!apiKey);
  }, []);
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
      description: "모든 문제 유형과 생성된 문제가 삭제되었습니다."
    });
  };
  const handleSliderChange = (value: number[]) => {
    const newDifficulty = String(value[0]) as "1" | "2" | "3";
    setLocalDifficulty(newDifficulty);
    onDifficultyChange?.(newDifficulty);
  };
  const handleComplexityChange = (level: string) => {
    setLocalComplexity(level);
    onComplexityChange?.(level);
  };
  return <div className="space-y-6">
      <div className="p-6 bg-[#F8F9FA] rounded-lg border border-[#D1D6DB] space-y-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#E9EDF1] to-[#F2F4F7] py-2.5 px-4 border-b border-[#D1D6DB]">
          <h3 className="text-center text-[#1A1F2C] font-semibold font-system text-sm flex items-center justify-center">
            <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            난이도 설정
          </h3>
        </div>
        
        <div className="space-y-6 px-2 relative z-10 pt-8">
          <DifficultySelector localDifficulty={localDifficulty} onDifficultyChange={handleSliderChange} complexity={localComplexity} onComplexityChange={handleComplexityChange} />
        </div>
      </div>

      <div className="flex flex-col space-y-3">
        <div className="flex items-center gap-3">
          <GenerateButton onClick={onGenerate} isLoading={isLoading} onStopGeneration={onStopGeneration} />
          <ClearButton onClick={handleClearAll} />
        </div>
        
        {/* Enhanced Loading Progress - positioned right below Generate Button */}
        {isLoading && progress && progress.total > 0 && <div className="relative">
            <LoadingProgress current={progress.current} total={progress.total} onStop={onStopGeneration} />
          </div>}
        
      </div>
    </div>;
};