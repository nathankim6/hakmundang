import React from 'react';
import { Button } from "@/components/ui/button";
import { Star, Settings } from "lucide-react";

interface ActionButtonsProps {
  openVocabModal: () => void;
}

export const ActionButtons = ({ openVocabModal }: ActionButtonsProps) => {
  const buttonBaseClass = "group relative w-full px-8 py-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 font-nanum font-bold";
  
  return (
    <div className="flex flex-col space-y-4 mt-8 px-4">
      <Button
        onClick={openVocabModal}
        className={`${buttonBaseClass} bg-gradient-to-r from-[#E5DEFF] via-[#FFDEE2] to-[#FDE1D3] text-gray-700 hover:opacity-90`}
      >
        <div className="flex items-center justify-center gap-2">
          <Star className="w-6 h-6 animate-spin-slow" />
          <span>단어장제작기</span>
        </div>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-200"></div>
      </Button>

      <a
        href="http://orunstudy.site"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          className={`${buttonBaseClass} bg-gradient-to-r from-[#E5DEFF] via-[#FFDEE2] to-[#FDE1D3] text-gray-700 hover:opacity-90`}
        >
          <div className="flex items-center justify-center gap-2">
            <Settings className="w-6 h-6 animate-spin-slow" />
            <span>옳은영어 학습매니지먼트</span>
          </div>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-200"></div>
        </Button>
      </a>
    </div>
  );
};