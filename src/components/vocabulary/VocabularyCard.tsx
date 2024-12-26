import React from 'react';
import { Card } from "@/components/ui/card";
import { Star, BookOpen } from "lucide-react";
import { TableRowData } from './types';

interface VocabularyCardProps {
  word: TableRowData;
  isFirstInQuestion?: boolean;
  questionNumber?: number;
}

export const VocabularyCard = ({ word, isFirstInQuestion, questionNumber }: VocabularyCardProps) => {
  const renderStars = (count: number) => {
    return [...Array(count)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${count === 3 ? 'text-red-500 fill-red-500' : 'text-yellow-400 fill-yellow-400'}`}
      />
    ));
  };

  return (
    <Card className="p-4 bg-white border-purple-100 hover:border-purple-200 transition-colors print:border-none print:shadow-none">
      <div className="space-y-4">
        {/* Header section with headword and difficulty */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            {isFirstInQuestion && questionNumber && (
              <div className="text-sm font-medium text-purple-600 mb-1">
                [문제 {questionNumber}]
              </div>
            )}
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-500" />
              <h4 className="text-xl font-bold text-purple-900 font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>
                {word.headword}
              </h4>
            </div>
            <p className="text-sm text-purple-600 font-medium">{word.partOfSpeech}</p>
          </div>
          <div className="flex -space-x-1">
            {renderStars(word.difficulty)}
          </div>
        </div>

        {/* Dictionary definition */}
        {word.meaning && (
          <div className="text-sm text-gray-700 italic border-l-2 border-purple-100 pl-3">
            {word.meaning}
          </div>
        )}

        {/* Synonyms and Antonyms section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-purple-400 rounded-full"></span>
              동의어
            </h5>
            <div className="text-sm text-gray-800">
              {word.synonyms.filter(Boolean).join(', ')}
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-rose-400 rounded-full"></span>
              반의어
            </h5>
            <div className="text-sm text-gray-800">
              {word.antonyms.filter(Boolean).join(', ')}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};