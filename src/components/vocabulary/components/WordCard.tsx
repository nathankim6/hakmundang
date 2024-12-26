import React from 'react';
import { Star } from 'lucide-react';
import { WordData } from '../types';
import { maskWord } from '../utils';

interface WordCardProps {
  word: WordData;
  examMode: number;
}

export const WordCard: React.FC<WordCardProps> = ({ word, examMode }) => {
  const renderDifficulty = (level: number) => (
    <div className="flex">
      {[...Array(level)].map((_, i) => (
        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3 print:border-gray-300 print:shadow-none">
      <div className="flex items-center mb-2">
        <span className="px-2 py-0.5 bg-blue-100 rounded text-blue-800 text-xs font-medium print:bg-blue-50">
          {word.품사}
        </span>
        <h2 className="ml-2 text-base font-bold text-blue-900 flex-shrink-0">
          {examMode === 1 ? maskWord(word.표제어) : word.표제어}
          <span className="ml-2 font-normal text-gray-600">
            {examMode === 2 ? maskWord(word.표제어뜻, '뜻쓰기') : word.표제어뜻}
          </span>
        </h2>
        <div className="ml-2 flex-shrink-0">
          {renderDifficulty(word.난이도)}
        </div>
      </div>

      <div className="mb-2 text-xs">
        <span className="font-medium text-blue-600 mr-1">영영사전</span>
        <span className="text-gray-600 italic">
          {examMode === 2 ? '' : word.영영정의}
        </span>
      </div>

      <div className="bg-gray-50 rounded-sm p-2 print:bg-gray-100">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          <div>
            <h3 className="font-medium text-gray-700 mb-1 flex items-center text-xs">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></span>
              유의어
            </h3>
            <div className="space-y-1">
              {word.동의어.map((syn, i) => (
                <div key={`syn-${i}`} className="flex items-center overflow-hidden">
                  <span className="text-blue-600 font-medium w-20 flex-shrink-0">
                    {examMode === 1 ? maskWord(syn) : syn}
                  </span>
                  <span className="mx-1 text-gray-400">|</span>
                  <span className="text-gray-600 truncate">
                    {examMode === 2 ? maskWord(word.동의어뜻[i], '뜻쓰기') : word.동의어뜻[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-1 flex items-center text-xs">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
              반의어
            </h3>
            <div className="space-y-1">
              {word.반의어.map((ant, i) => (
                <div key={`ant-${i}`} className="flex items-center overflow-hidden">
                  <span className="text-red-600 font-medium w-20 flex-shrink-0">
                    {examMode === 1 ? maskWord(ant) : ant}
                  </span>
                  <span className="mx-1 text-gray-400">|</span>
                  <span className="text-gray-600 truncate">
                    {examMode === 2 ? maskWord(word.반의어뜻[i], '뜻쓰기') : word.반의어뜻[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};