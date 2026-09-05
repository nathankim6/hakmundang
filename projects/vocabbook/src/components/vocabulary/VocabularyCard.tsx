import React, { useState, useRef, useEffect } from 'react';
import { Star, CheckSquare, Square } from 'lucide-react';
import { WordData } from '@/types/vocabulary';
import { RelatedWordsSection } from './RelatedWordsSection';

interface VocabularyCardProps {
  word: WordData;
  examMode: number;
  maskWord: (word: string, mode?: string) => string;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({
  word,
  examMode,
  maskWord,
}) => {
  const [readCount, setReadCount] = useState(0);
  const [headwordFontSize, setHeadwordFontSize] = useState('text-2xl');
  const [meaningFontSize, setMeaningFontSize] = useState('text-sm');
  const headwordRef = useRef<HTMLDivElement>(null);
  const meaningRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adjustFontSize = () => {
      if (headwordRef.current) {
        const wordLength = word.표제어.length;
        if (wordLength > 12) {
          setHeadwordFontSize('text-xl');
        } else if (wordLength > 8) {
          setHeadwordFontSize('text-2xl');
        }
      }

      if (meaningRef.current) {
        const meaningLength = word.표제어뜻.length;
        if (meaningLength > 50) {
          setMeaningFontSize('text-xs leading-tight');
        } else if (meaningLength > 30) {
          setMeaningFontSize('text-sm leading-snug');
        }
      }
    };

    adjustFontSize();
  }, [word.표제어, word.표제어뜻]);

  const renderDifficulty = (level: number) => (
    <div className="flex">
      {[...Array(level)].map((_, i) => (
        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
      ))}
    </div>
  );

  const handleCheckClick = (index: number) => {
    if (index === readCount) {
      setReadCount(index + 1);
    } else if (index === readCount - 1) {
      setReadCount(index);
    }
  };

  const renderCheckboxes = () => (
    <div className="flex gap-1 print:gap-2">
      {[0, 1, 2].map((index) => (
        <button
          key={index}
          onClick={() => handleCheckClick(index)}
          className="focus:outline-none print:cursor-default"
        >
          {index < readCount ? (
            <CheckSquare className="w-4 h-4 text-[#9b87f5]" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
        </button>
      ))}
    </div>
  );

  const formatMeanings = (meaning: string) => {
    const meanings = [...new Set(meaning.split(',').map(m => m.trim()))];
    if (meanings.length === 1) return meaning;
    return meanings.map((m, i) => `${i + 1}. ${m}`).join(' ');
  };

  return (
    <div className="relative bg-white rounded-lg shadow-md print:p-2 p-2 hover:shadow-lg transition-all duration-200 print:shadow-none transform hover:-translate-y-1 h-[220px] print:h-[230px] flex flex-col
      before:content-[''] before:absolute before:inset-0 before:border-2 before:border-[#9b87f5]/30 before:rounded-lg
      after:content-[''] after:absolute after:inset-[3px] after:border after:border-[#E5DEFF] after:rounded-lg">
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-1 print:mb-0.5">
          <div className="flex items-center gap-1">
            <div className="flex-shrink-0">
              {renderDifficulty(word.난이도)}
            </div>
            <span className="px-2 py-0.5 bg-gradient-to-r from-[#F2FCE2] to-[#E5DEFF] rounded-full text-[#7E69AB] text-[10px] whitespace-nowrap font-medium print:bg-purple-50">
              {word.품사}
            </span>
          </div>
          {renderCheckboxes()}
        </div>

        <div className="flex flex-col gap-0.5 mb-1">
          <div className="flex items-baseline gap-1.5 flex-wrap" ref={headwordRef}>
            <h2 className={`text-[#003366] font-extrabold leading-none font-['Black Han Sans'] ${headwordFontSize} break-words max-w-full`}>
              {examMode === 1 ? maskWord(word.표제어) : word.표제어}
            </h2>
            <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
              {examMode !== 1 && (
                <span className="text-[#888888] text-[10px] whitespace-nowrap flex-shrink-0">
                  [{word.발음}]
                </span>
              )}
              <div ref={meaningRef} className={`text-gray-700 font-bold font-['Pretendard'] ${meaningFontSize} break-words`}>
                {examMode === 2 ? maskWord(word.표제어뜻, '뜻쓰기') : formatMeanings(word.표제어뜻)}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-0.5 text-[10px]">
          <span className="font-bold text-[#7E69AB] mr-1">영영사전</span>
          {examMode !== 1 && (
            <span className="text-gray-600 italic line-clamp-2 font-medium font-['Pretendard'] text-[10px] break-words">
              {examMode === 2 ? '' : word.영영정의}
            </span>
          )}
        </div>

        <div className="bg-gradient-to-br from-[#F1F0FB]/80 to-[#E5DEFF]/80 rounded-md p-1 print:p-1 print:bg-gray-50 mt-0.5 flex-1 min-h-0">
          <div className="grid grid-cols-2 gap-x-2 divide-x divide-[#9b87f5]/20 h-full">
            <RelatedWordsSection
              title="유의어"
              words={word.동의어 || []}
              meanings={word.동의어뜻 || []}
              type="synonym"
              examMode={examMode}
              maskWord={maskWord}
            />
            <RelatedWordsSection
              title="반의어"
              words={word.반의어 || []}
              meanings={word.반의어뜻 || []}
              type="antonym"
              examMode={examMode}
              maskWord={maskWord}
            />
          </div>
        </div>
      </div>
    </div>
  );
};