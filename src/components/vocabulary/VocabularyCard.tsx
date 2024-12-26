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
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-bold font-serif text-indigo-900 tracking-wide">
                {word.headword}
              </h4>
              <span className="text-sm text-purple-600 font-medium">{word.partOfSpeech}</span>
            </div>
          </div>
          <div className="flex -space-x-1">
            {[...Array(word.difficulty)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${word.difficulty === 3 ? 'text-red-500 fill-red-500' : 'text-yellow-400 fill-yellow-400'}`}
              />
            ))}
          </div>
        </div>

        {/* Dictionary definition */}
        {word.meaning && (
          <div className="pl-4 border-l-2 border-indigo-100">
            <p className="text-sm text-gray-700 italic font-serif">{word.meaning}</p>
          </div>
        )}

        {/* Synonyms and Antonyms section */}
        <div className="grid grid-cols-2 gap-4">
          {/* Synonyms */}
          <div className="space-y-1">
            <h5 className="text-sm font-semibold text-purple-700 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-purple-400 rounded-full"></span>
              동의어
            </h5>
            <div className="flex flex-wrap gap-2">
              {word.synonyms.map((synonym, index) => (
                synonym && (
                  <span key={index} className="text-sm bg-purple-50 px-2 py-1 rounded-full text-purple-700">
                    {synonym}
                  </span>
                )
              ))}
            </div>
          </div>

          {/* Antonyms */}
          <div className="space-y-1">
            <h5 className="text-sm font-semibold text-rose-700 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-rose-400 rounded-full"></span>
              반의어
            </h5>
            <div className="flex flex-wrap gap-2">
              {word.antonyms.map((antonym, index) => (
                antonym && (
                  <span key={index} className="text-sm bg-rose-50 px-2 py-1 rounded-full text-rose-700">
                    {antonym}
                  </span>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};