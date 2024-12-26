import React from 'react';
import { Input } from "@/components/ui/input";

interface VocabularyEntry {
  headword: string;
  meaning: string;
  synonyms: string;
  synonymMeanings: string;
  antonyms: string;
  antonymMeanings: string;
  questionNumber?: number;
}

interface VocabularyTableProps {
  vocabularyList: VocabularyEntry[];
  onEditEntry: (index: number, field: keyof VocabularyEntry, value: string) => void;
}

export const VocabularyTable = ({ vocabularyList, onEditEntry }: VocabularyTableProps) => {
  let currentQuestionNumber: number | undefined;

  const formatMultipleEntries = (text: string) => {
    return text.split(',').join('\n');
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] text-white">
            <th className="p-3 text-left text-lg font-nanum">표제어</th>
            <th className="p-3 text-left text-lg font-nanum">표제어뜻</th>
            <th className="p-3 text-left text-lg font-nanum">동의어</th>
            <th className="p-3 text-left text-lg font-nanum">동의어뜻</th>
            <th className="p-3 text-left text-lg font-nanum">반의어</th>
            <th className="p-3 text-left text-lg font-nanum">반의어뜻</th>
          </tr>
        </thead>
        <tbody className="text-base">
          {vocabularyList.map((entry, index) => {
            const showQuestionHeader = entry.questionNumber !== currentQuestionNumber;
            currentQuestionNumber = entry.questionNumber;

            return (
              <React.Fragment key={index}>
                {showQuestionHeader && entry.questionNumber && (
                  <tr>
                    <td colSpan={6} className="bg-[#F1F0FB] p-3 font-semibold text-[#1A1F2C] text-lg">
                      문제 {entry.questionNumber}
                    </td>
                  </tr>
                )}
                <tr className={index % 2 === 0 ? 'bg-[#F1F0FB]' : 'bg-white'}>
                  {Object.entries(entry).map(([key, value], cellIndex) => {
                    if (key === 'questionNumber') return null;
                    return (
                      <td key={cellIndex} className="p-3 border border-[#D6BCFA]/30">
                        <textarea
                          value={formatMultipleEntries(value)}
                          onChange={(e) => onEditEntry(index, key as keyof VocabularyEntry, e.target.value)}
                          className="w-full bg-transparent border-none hover:bg-white focus:bg-white font-nanum min-h-[60px] resize-y p-1 text-base"
                          style={{ whiteSpace: 'pre-wrap' }}
                        />
                      </td>
                    );
                  })}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};