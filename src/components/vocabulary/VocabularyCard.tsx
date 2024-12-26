import React from 'react';
import { Card } from "@/components/ui/card";
import { Star, BookOpen, MessageSquare } from "lucide-react";
import { TableRowData } from './types';

interface VocabularyCardProps {
  word: TableRowData;
  isFirstInQuestion?: boolean;
  questionNumber?: number;
}

export const VocabularyCard = ({ word, isFirstInQuestion, questionNumber }: VocabularyCardProps) => {
  return (
    <Card className="p-4 bg-white border-purple-100 hover:border-purple-200 transition-colors print:border-none print:shadow-none">
      <div className="grid grid-cols-[1fr,1.5fr] gap-4">
        {/* Left side - Headword information */}
        <div className="space-y-3 border-r border-purple-100 pr-4">
          <div className="flex items-start justify-between">
            <div>
              {isFirstInQuestion && questionNumber && (
                <div className="text-sm font-medium text-purple-600 mb-1">
                  [문제 {questionNumber}]
                </div>
              )}
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <h4 className="text-lg font-bold text-purple-900 font-serif">{word.headword}</h4>
              </div>
              <p className="text-sm text-purple-600 font-medium">{word.partOfSpeech}</p>
            </div>
            <div className="flex -space-x-1">
              {[...Array(word.difficulty)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
          </div>
          
          {word.example && (
            <div className="space-y-1">
              <div className="flex items-center text-gray-600 text-sm">
                <MessageSquare className="w-4 h-4 mr-1" />
                예문
              </div>
              <p className="text-sm text-gray-800 italic font-serif">{word.example}</p>
              <p className="text-sm text-gray-600">{word.exampleTranslation}</p>
            </div>
          )}
        </div>

        {/* Right side - Synonyms and Antonyms */}
        <div className="grid grid-rows-2 gap-4">
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-purple-700 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-purple-400 rounded-full"></span>
              동의어
            </h5>
            <div className="grid grid-cols-1 gap-2">
              {word.synonyms.map((synonym, index) => (
                synonym && (
                  <div key={index} className="text-sm border-l-2 border-purple-100 pl-2">
                    <p className="text-gray-800 font-medium font-serif">{synonym}</p>
                    <p className="text-gray-600 text-xs">{word.synonymMeanings[index]}</p>
                  </div>
                )
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-purple-700 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-rose-400 rounded-full"></span>
              반의어
            </h5>
            <div className="grid grid-cols-1 gap-2">
              {word.antonyms.map((antonym, index) => (
                antonym && (
                  <div key={index} className="text-sm border-l-2 border-rose-100 pl-2">
                    <p className="text-gray-800 font-medium font-serif">{antonym}</p>
                    <p className="text-gray-600 text-xs">{word.antonymMeanings[index]}</p>
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