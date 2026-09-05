
import React from 'react';
import { Button } from "@/components/ui/button";
import { Star, Bug, Book } from "lucide-react";

interface ActionButtonsProps {
  openVocabModal: () => void;
  onGenerate?: () => void;
  isLoading?: boolean;
  difficulty?: string;
  onDifficultyChange?: (level: string) => void;
  onStopGeneration?: () => void;
  handleDownloadDoc?: () => void;
}

export const ActionButtons = ({ 
  openVocabModal,
  onGenerate,
  isLoading,
  difficulty,
  onDifficultyChange,
  onStopGeneration,
  handleDownloadDoc
}: ActionButtonsProps) => {
  const buttonBaseClass = "group relative w-full px-8 py-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 font-nanum font-bold";
  
  return (
    <div className="flex flex-col space-y-4 mt-8 px-4">
      <a
        href="https://blankify-choice-tool.lovable.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full"
      >
        <Button
          className={`${buttonBaseClass} bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#818CF8] text-white hover:opacity-90`}
        >
          <div className="flex items-center justify-center gap-2">
            <Book className="w-6 h-6 animate-spin-slow" />
            <span>워크북제작기</span>
          </div>
        </Button>
      </a>

      <a
        href="https://vocabbook-60.lovable.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full"
      >
        <Button
          className={`${buttonBaseClass} bg-gradient-to-r from-[#9b87f5] via-[#D6BCFA] to-[#7E69AB] text-white hover:opacity-90`}
        >
          <div className="flex items-center justify-center gap-2">
            <Star className="w-6 h-6 animate-spin-slow" />
            <span>단어장제작기</span>
          </div>
        </Button>
      </a>

      <a
        href="https://vocal-sherbet-9f540f.netlify.app/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          className={`${buttonBaseClass} bg-gradient-to-r from-[#FF6B6B] via-[#FF8787] to-[#FFA5A5] text-white hover:opacity-90`}
        >
          <div className="flex items-center justify-center gap-2">
            <Bug className="w-6 h-6 animate-spin-slow" />
            <span>오류보고 및 업데이트</span>
          </div>
        </Button>
      </a>
    </div>
  );
};
