import React from 'react';
import { Edit2, Printer } from 'lucide-react';

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
  return (
    <header className="bg-white shadow-sm print:shadow-none">
      <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img 
            src="/api/placeholder/80/80" 
            alt="Orun Academy Logo" 
            className="h-8 w-auto print:hidden"
          />
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyPress={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 focus:outline-none"
              autoFocus
            />
          ) : (
            <h1 
              className="text-xl font-bold text-gray-800 font-sans hover:cursor-pointer flex items-center gap-2 print:text-2xl"
              onClick={() => setIsEditingTitle(true)}
            >
              {title}
              <Edit2 className="w-4 h-4 text-gray-400 print:hidden" />
            </h1>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 print:hidden">
            <button
              onClick={() => setExamMode(0)}
              className={`px-4 py-2 rounded-md ${
                examMode === 0 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              학습모드
            </button>
            <button
              onClick={() => setExamMode(1)}
              className={`px-4 py-2 rounded-md ${
                examMode === 1 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              철자쓰기
            </button>
            <button
              onClick={() => setExamMode(2)}
              className={`px-4 py-2 rounded-md ${
                examMode === 2 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              뜻쓰기
            </button>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 print:hidden"
          >
            <Printer className="w-4 h-4 mr-2" />
            PDF 출력
          </button>
        </div>
      </div>
    </header>
  );
};