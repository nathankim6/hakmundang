import React from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Settings } from "lucide-react";

interface ActionButtonsProps {
  openVocabModal: () => void;
  openAIManagementModal: () => void;
}

export const ActionButtons = ({ openVocabModal, openAIManagementModal }: ActionButtonsProps) => {
  const buttonBaseClass = "group relative px-8 py-6 text-white rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-1 text-lg font-semibold";
  
  return (
    <div className="flex justify-center mt-8 space-x-4">
      <Button
        onClick={openVocabModal}
        className={`${buttonBaseClass} bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700`}
      >
        <BookOpen className="w-6 h-6 mr-2 animate-pulse" />
        단어장생성기
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-200"></div>
      </Button>

      <Button
        onClick={openAIManagementModal}
        className={`${buttonBaseClass} bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600`}
      >
        <Settings className="w-6 h-6 mr-2 animate-spin-slow" />
        AI학습매니지먼트
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-200"></div>
      </Button>
    </div>
  );
};