import React from 'react';
import { VocabularyTableHeader } from './VocabularyTableHeader';
import { VocabularyEntry as VocabularyEntryComponent } from './VocabularyEntry';
import type { VocabularyEntry } from './VocabularyParser';

interface VocabularyTableProps {
  vocabularyList: VocabularyEntry[];
  onEditEntry: (index: number, field: keyof VocabularyEntry, value: string) => void;
}

export const VocabularyTable = ({ vocabularyList, onEditEntry }: VocabularyTableProps) => {
  let currentQuestionNumber: number | undefined;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <VocabularyTableHeader />
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
                  <VocabularyEntryComponent
                    entry={entry}
                    index={index}
                    onEditEntry={onEditEntry}
                  />
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};