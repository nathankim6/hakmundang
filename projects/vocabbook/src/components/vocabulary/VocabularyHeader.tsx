import React from 'react';
import { Printer, RotateCw } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import html2pdf from 'html2pdf.js';

interface VocabularyHeaderProps {
  title: string;
  isEditingTitle: boolean;
  examMode: number;
  setTitle: (title: string) => void;
  setIsEditingTitle: (isEditing: boolean) => void;
  setExamMode: (mode: number) => void;
  handlePrint: () => void;
}

export const VocabularyHeader: React.FC<VocabularyHeaderProps> = ({
  title,
  isEditingTitle,
  examMode,
  setTitle,
  setIsEditingTitle,
  setExamMode,
  handlePrint,
}) => {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
    }
  };

  const handleExamModeChange = async (mode: number) => {
    setExamMode(mode);
    if (mode === 1 || mode === 2) {
      // Wait for state update and re-render
      setTimeout(async () => {
        handlePrint();
      }, 100);
    }
  };

  return (
    <header className="bg-white shadow-sm print:hidden">
      <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {isEditingTitle ? (
            <Input
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyPress={handleKeyPress}
              className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 focus:outline-none bg-transparent w-96"
              autoFocus
            />
          ) : (
            <h1 className="text-xl font-bold text-gray-800 font-sans print:text-2xl">
              {title}
            </h1>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handleExamModeChange(0)}
            className={examMode === 0 ? "bg-purple-100" : ""}
          >
            <RotateCw className="w-4 h-4 mr-1" />
            원본
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExamModeChange(2)}
            className={examMode === 2 ? "bg-purple-100" : ""}
          >
            시험지(의미)
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExamModeChange(1)}
            className={examMode === 1 ? "bg-purple-100" : ""}
          >
            시험지(철자)
          </Button>
          <Button
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            PDF 출력
          </Button>
        </div>
      </div>
    </header>
  );
};