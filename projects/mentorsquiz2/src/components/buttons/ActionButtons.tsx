import React from 'react';
import { Button } from "@/components/ui/button";
import { Book, ExternalLink, Calculator, PenTool, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
interface ActionButtonsProps {
  openVocabModal: () => void;
  onGenerate?: () => void;
  isLoading?: boolean;
  difficulty?: string;
  complexity?: string;
  onDifficultyChange?: (level: string) => void;
  onComplexityChange?: (level: string) => void;
  onStopGeneration?: () => void;
  handleDownloadDoc?: () => void;
}
export const ActionButtons = ({
  openVocabModal,
  onGenerate,
  isLoading,
  difficulty,
  complexity,
  onDifficultyChange,
  onComplexityChange,
  onStopGeneration,
  handleDownloadDoc
}: ActionButtonsProps) => {
  return <div className="flex flex-col space-y-3 mt-8">
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-gray-100 to-gray-50">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-2 px-4">
          <h3 className="text-sm font-bold flex items-center">
            <FileText className="w-4 h-4 mr-2 opacity-80" />
            <span className="font-system tracking-wide">학습 도구 모음</span>
          </h3>
        </div>
        
        <div className="space-y-2 p-3">
          <a href="https://blankify-choice-tool.lovable.app/" target="_blank" rel="noopener noreferrer" className="block">
            
          </a>

          <a href="https://vocabbook-60.lovable.app/" target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" className="w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-indigo-200 text-gray-800 flex items-center justify-between py-3 px-4 rounded-md shadow-sm hover:shadow transition-all duration-200 group">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-md flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 mr-3 group-hover:scale-105 transition-transform">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-nanum font-bold text-gray-900">단어장제작기</span>
                </div>
              </div>
              <div className="bg-gray-100 rounded-full p-1 group-hover:bg-indigo-100 transition-colors">
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              </div>
            </Button>
          </a>

          <a href="https://vocal-sherbet-9f540f.netlify.app/" target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" className="w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-indigo-200 text-gray-800 flex items-center justify-between py-3 px-4 rounded-md shadow-sm hover:shadow transition-all duration-200 group">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-md flex items-center justify-center bg-gradient-to-br from-rose-500 to-rose-600 mr-3 group-hover:scale-105 transition-transform">
                  <PenTool className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-nanum font-bold text-gray-900">오류보고 및 업데이트</span>
                </div>
              </div>
              <div className="bg-gray-100 rounded-full p-1 group-hover:bg-indigo-100 transition-colors">
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              </div>
            </Button>
          </a>
        </div>

        
      </Card>
    </div>;
};