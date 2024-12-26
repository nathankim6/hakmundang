import React from 'react';
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { TableRowData } from './types';

interface VocabularyCardProps {
  word: TableRowData;
  showQuestionNumber?: boolean;
  questionNumber?: number;
}

export const VocabularyCard = ({ word, showQuestionNumber, questionNumber }: VocabularyCardProps) => {
  const getDifficultyLabel = (difficulty: number) => {
    switch(difficulty) {
      case 1: return "중학교/고1 수준";
      case 2: return "고2 수준";
      case 3: return "고3/대학 수준";
      default: return "중학교/고1 수준";
    }
  };

  return (
    <Card className="p-4 bg-white border-purple-100 hover:border-purple-200 transition-colors print:border-none print:shadow-none">
      <div className="grid grid-cols-[1fr,1.5fr] gap-4">
        {/* Left side - Headword information */}
        <div className="space-y-2 border-r border-purple-100 pr-4 print:border-r-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {showQuestionNumber && (
                <div className="text-sm font-medium text-purple-600 mb-1">
                  [문제 {questionNumber}]
                </div>
              )}
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-purple-900 font-serif">{word.headword}</h4>
                <div className="flex -space-x-1">
                  {[...Array(word.difficulty)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-purple-600 font-medium">{word.partOfSpeech}</p>
                <span className="text-xs text-gray-500">({getDifficultyLabel(word.difficulty)})</span>
              </div>
            </div>
          </div>
          
          {word.example && (
            <div className="space-y-1 bg-gray-50 p-2 rounded-md print:bg-transparent print:border print:border-gray-200">
              <p className="text-sm text-gray-800 italic font-serif">{word.example}</p>
              <p className="text-sm text-gray-600">{word.exampleTranslation}</p>
            </div>
          )}
        </div>

        {/* Right side - Synonyms and Antonyms */}
        <div className="grid grid-rows-2 gap-3">
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-purple-700 border-b border-purple-100 pb-1">동의어</h5>
            <div className="grid grid-cols-1 gap-2">
              {word.synonyms.map((synonym, index) => (
                synonym && (
                  <div key={index} className="text-sm flex justify-between items-start">
                    <span className="font-medium text-gray-800">{synonym}</span>
                    <span className="text-gray-600 text-xs">{word.synonymMeanings[index]}</span>
                  </div>
                )
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-purple-700 border-b border-purple-100 pb-1">반의어</h5>
            <div className="grid grid-cols-1 gap-2">
              {word.antonyms.map((antonym, index) => (
                antonym && (
                  <div key={index} className="text-sm flex justify-between items-start">
                    <span className="font-medium text-gray-800">{antonym}</span>
                    <span className="text-gray-600 text-xs">{word.antonymMeanings[index]}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};