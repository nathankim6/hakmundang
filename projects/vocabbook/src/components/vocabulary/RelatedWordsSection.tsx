import React from 'react';
import { RelatedWord } from './RelatedWord';

interface RelatedWordsSectionProps {
  title: string;
  words: string[];
  meanings: string[];
  type: 'synonym' | 'antonym';
  examMode: number;
  maskWord: (word: string, mode?: string) => string;
}

export const RelatedWordsSection: React.FC<RelatedWordsSectionProps> = ({
  title,
  words,
  meanings,
  type,
  examMode,
  maskWord,
}) => {
  const colorClass = type === 'synonym' ? 'bg-[#9b87f5]' : 'bg-red-500';
  
  // If it's antonyms and there are no words, return empty div to maintain layout
  if (type === 'antonym' && (!words.length || !meanings.length)) {
    return <div className="w-full min-w-0 px-1" />;
  }
  
  return (
    <div className="w-full min-w-0 px-1">
      <h3 className="font-bold text-gray-700 mb-0.5 flex items-center text-[10px] font-['Pretendard']">
        <span className={`w-1 h-1 ${colorClass} rounded-full mr-1`}></span>
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-y-0.5">
        {words.slice(0, 4).map((word, i) => (
          i % 2 === 0 && (
            <div key={`${type}-${i}`} className="grid grid-cols-2 gap-x-1">
              <RelatedWord
                word={words[i]}
                meaning={meanings[i]}
                type={type}
                examMode={examMode}
                maskWord={maskWord}
              />
              {words[i + 1] && meanings[i + 1] && (
                <RelatedWord
                  word={words[i + 1]}
                  meaning={meanings[i + 1]}
                  type={type}
                  examMode={examMode}
                  maskWord={maskWord}
                />
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );
};