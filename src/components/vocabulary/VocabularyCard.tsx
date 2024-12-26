import React from 'react';
import { Card } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { TableRowData } from './types';

interface VocabularyCardProps {
  word: TableRowData;
}

export const VocabularyCard = ({ word }: VocabularyCardProps) => {
  return (
    <Card className="p-4 bg-white border-purple-100 hover:border-purple-200 transition-colors">
      <div className="grid grid-cols-[1fr,1.5fr] gap-4">
        {/* Left side - Headword information */}
        <div className="space-y-3 border-r border-purple-100 pr-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-bold text-purple-900">{word.headword}</h4>
              <p className="text-sm text-purple-600">{word.partOfSpeech}</p>
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
              <p className="text-sm text-gray-800 italic">{word.example}</p>
              <p className="text-sm text-gray-600">{word.exampleTranslation}</p>
            </div>
          )}
        </div>

        {/* Right side - Synonyms and Antonyms */}
        <div className="grid grid-rows-2 gap-4">
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-purple-700">동의어</h5>
            <div className="grid grid-cols-2 gap-2">
              {word.synonyms.map((synonym, index) => (
                synonym && (
                  <div key={index} className="text-sm">
                    <p className="text-gray-800">{synonym}</p>
                    <p className="text-gray-600 text-xs">{word.synonymMeanings[index]}</p>
                  </div>
                )
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-purple-700">반의어</h5>
            <div className="grid grid-cols-2 gap-2">
              {word.antonyms.map((antonym, index) => (
                antonym && (
                  <div key={index} className="text-sm">
                    <p className="text-gray-800">{antonym}</p>
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