import React from 'react';
import { Button } from "@/components/ui/button";
import { Star, Settings } from "lucide-react";

interface ActionButtonsProps {
  openVocabModal: () => void;
  openAIManagementModal: () => void;
}

export const ActionButtons = ({ openVocabModal, openAIManagementModal }: ActionButtonsProps) => {
  const buttonBaseClass = "group relative w-full px-8 py-6 text-white rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-1 text-lg font-semibold";
  
  return (
    <div className="flex flex-col space-y-4 mt-8 px-4">
      <Button
        onClick={openVocabModal}
        className={`${buttonBaseClass} bg-[#1A1F2C] hover:bg-[#2A2F3C] border border-[#2A2F3C]/50`}
      >
        <div className="flex items-center justify-center gap-2">
          <Star className="w-6 h-6 text-[#FFD700]" />
          <span>단어장생성기</span>
        </div>
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-200"></div>
      </Button>

      <Button
        onClick={openAIManagementModal}
        className={`${buttonBaseClass} bg-[#1A1F2C] hover:bg-[#2A2F3C] border border-[#2A2F3C]/50`}
      >
        <div className="flex items-center justify-center gap-2">
          <Settings className="w-6 h-6 animate-spin-slow text-[#FFD700]" />
          <span>옳은영어 자비스2.0</span>
        </div>
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-200"></div>
      </Button>
    </div>
  );
};