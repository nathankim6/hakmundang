import React from 'react';
import { VocabularyDialog } from './vocabulary/VocabularyDialog';
import { QuestionData, TableRowData } from './vocabulary/types';

interface Question {
  id: string;
  content: string;
  questionNumber: number;
}

interface SynonymAntonymEditorProps {
  questions: Question[];
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

          // Ensure we have exactly 3 entries for synonyms and antonyms
          const paddedSynonyms = [...synonyms, '', '', ''].slice(0, 3);
          const paddedSynonymMeanings = [...synonymMeanings, '', '', ''].slice(0, 3);
          const paddedAntonyms = [...antonyms, '', '', ''].slice(0, 3);
          const paddedAntonymMeanings = [...antonymMeanings, '', '', ''].slice(0, 3);

          rows.push({
            headword: cells[1],
            meaning: cells[2],
            difficulty: 1,
            partOfSpeech: '',
            example: '',
            synonyms: paddedSynonyms,
            synonymMeanings: paddedSynonymMeanings,
            antonyms: paddedAntonyms,
            antonymMeanings: paddedAntonymMeanings
          });
        }
      }
    }
  });

  return rows;
}

export const SynonymAntonymEditor = ({ questions }: SynonymAntonymEditorProps) => {
  const questionData: QuestionData[] = questions.map((question, index) => ({
    number: question.questionNumber,
    rows: parseQuestionContent(question.content)
  }));

  return <VocabularyDialog questions={questionData} />;
};