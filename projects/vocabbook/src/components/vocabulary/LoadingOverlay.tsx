import React from 'react';
import { Progress } from "@/components/ui/progress";

interface LoadingOverlayProps {
  currentText: number;
  totalTexts: number;
  currentWord: number;
  totalWords: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  currentText,
  totalTexts,
  currentWord,
  totalWords,
}) => {
  const textProgress = (currentText / totalTexts) * 100;
  const wordProgress = (currentWord / totalWords) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">단어장 생성 중...</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">전체 진행도</span>
              <span className="text-sm font-medium">{Math.round(textProgress)}%</span>
            </div>
            <Progress value={textProgress} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">현재 지문 진행도</span>
              <span className="text-sm font-medium">{Math.round(wordProgress)}%</span>
            </div>
            <Progress value={wordProgress} className="h-2" />
          </div>
          <p className="text-sm text-gray-600 text-center mt-4">
            {currentText}/{totalTexts} 번째 지문 처리 중<br />
            ({currentWord}/{totalWords} 단어 처리됨)
          </p>
        </div>
      </div>
    </div>
  );
};