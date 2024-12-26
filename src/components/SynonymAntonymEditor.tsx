import React from 'react';
import { VocabularyDialog } from './vocabulary/VocabularyDialog';
import { QuestionData, TableRowData } from './vocabulary/types';

interface SynonymAntonymEditorProps {
  questions: QuestionData[];
}

const parseQuestionContent = (content: string): TableRowData[] => {
  const rows: TableRowData[] = [];
  const lines = content.split('\n');
  
  lines.forEach(line => {
    if (line.includes('|')) {
      const cells = line.split('|').map(cell => cell.trim());
      if (cells.length >= 7 && !line.includes('-----')) {
        if (cells[1] && cells[1] !== '표제어') {
          const synonyms = cells[3].split(/[,;\n]/).map(s => s.trim()).filter(s => s);
          const synonymMeanings = cells[4].split(/[,;\n]/).map(s => s.trim()).filter(s => s);
          const antonyms = cells[5].split(/[,;\n]/).map(s => s.trim()).filter(s => s);
          const antonymMeanings = cells[6].split(/[,;\n]/).map(s => s.trim()).filter(s => s);

          rows.push({
            headword: cells[1],
            meaning: cells[2],
            difficulty: 1,
            partOfSpeech: '',
            example: '',
            synonyms: [...synonyms, '', '', ''].slice(0, 3),
            synonymMeanings: [...synonymMeanings, '', '', ''].slice(0, 3),
            antonyms: [...antonyms, '', '', ''].slice(0, 3),
            antonymMeanings: [...antonymMeanings, '', '', ''].slice(0, 3)
          });
        }
      }
    }
  });

  return rows;
}

export const SynonymAntonymEditor = ({ questions }: SynonymAntonymEditorProps) => {
  return <VocabularyDialog questions={questions} />;
};