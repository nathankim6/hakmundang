import React, { useState, useEffect } from 'react';

interface RelatedWordProps {
  word: string;
  meaning: string;
  type: 'synonym' | 'antonym';
  examMode: number;
  maskWord: (word: string, mode?: string) => string;
}

export const RelatedWord: React.FC<RelatedWordProps> = ({
  word,
  meaning,
  type,
  examMode,
  maskWord,
}) => {
  const [wordFontSize, setWordFontSize] = useState('text-[11px]');
  const colorClass = type === 'synonym' ? 'text-[#9b87f5]' : 'text-red-600';
  const cleanWord = word.replace(/\s*\([^)]*\)\s*/g, '');
  
  useEffect(() => {
    // Adjust font size based on word length
    if (cleanWord.length > 12) {
      setWordFontSize('text-[9px]');
    } else if (cleanWord.length > 8) {
      setWordFontSize('text-[10px]');
    } else {
      setWordFontSize('text-[11px]');
    }
  }, [cleanWord]);
  
  return (
    <div className="flex flex-col gap-0.5 w-full min-w-0">
      <span className={`${colorClass} font-bold ${wordFontSize} flex-shrink-0 font-['Pretendard']`}>
        {examMode === 1 ? maskWord(cleanWord) : cleanWord}
      </span>
      <span className="text-gray-600 text-[10px] font-medium font-['Pretendard']">
        {examMode === 2 ? maskWord(meaning, '뜻쓰기') : meaning}
      </span>
    </div>
  );
};