import React from 'react';
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { TableRowData } from './types';

interface VocabularyCardProps {
  word: TableRowData;
}

export const VocabularyCard = ({ word }: VocabularyCardProps) => {
  const renderStarDifficulty = (difficulty: number) => {
    const stars = [];
    for (let i = 0; i < difficulty; i++) {
      stars.push(
        <Star 
          key={i} 
          className="w-3 h-3 text-yellow-400 fill-yellow-400" 
          aria-label={`난이도 ${difficulty}단계`}
        />
      );
    }
    return stars;
  };

  const renderWordPairs = (words: string[], meanings: string[]) => {
    return words.map((word, index) => {
      if (!word) return null;
      return (
        <div key={index} className="flex flex-col space-y-0.5">
          <span className="font-medium text-gray-800">{word}</span>
          {meanings[index] && (
            <span className="text-xs text-gray-600">{meanings[index]}</span>
          )}
        </div>
      );
    });
  };

  return (
    <Card className="p-3 bg-white border-purple-100 hover:border-purple-200 transition-colors print:shadow-none print:border-gray-300">
      <div className="grid grid-cols-[1fr,2fr] gap-3">
        {/* Left side - Headword information */}
        <div className="space-y-2 border-r border-purple-100 pr-3 print:border-gray-300">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-base font-bold text-purple-900 print:text-black">
                {word.headword}
              </h4>
              <p className="text-xs text-purple-600 print:text-gray-600">
                {word.partOfSpeech}
              </p>
            </div>
            <div className="flex -space-x-0.5">
              {renderStarDifficulty(word.difficulty)}
            </div>
          </div>
          
          <p className="text-sm text-gray-800">{word.meaning}</p>

          {word.example && (
            <div className="space-y-1">
              <p className="text-xs text-gray-800 italic">{word.example}</p>
              {word.exampleTranslation && (
                <p className="text-xs text-gray-600">{word.exampleTranslation}</p>
              )}
            </div>
          )}
        </div>

        {/* Right side - Synonyms and Antonyms */}
        <div className="grid grid-rows-2 gap-2">
          <div className="space-y-1.5">
            <h5 className="text-xs font-semibold text-purple-700 print:text-gray-700">
              동의어
            </h5>
            <div className="grid grid-cols-2 gap-2">
              {renderWordPairs(word.synonyms, word.synonymMeanings)}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <h5 className="text-xs font-semibold text-purple-700 print:text-gray-700">
              반의어
            </h5>
            <div className="grid grid-cols-2 gap-2">
              {renderWordPairs(word.antonyms, word.antonymMeanings)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};