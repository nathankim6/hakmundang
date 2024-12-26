import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generateDocument } from "@/utils/documentGenerator";
import { VocabularyTable } from './vocabulary/VocabularyTable';
import { ExportToolbar } from './vocabulary/ExportToolbar';
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
          rows.push({
            headword: cells[1],
            meaning: cells[2],
            difficulty: 1,
            partOfSpeech: '',
            example: '',
            synonyms: [cells[3], '', ''],
            synonymMeanings: [cells[4], '', ''],
            antonyms: [cells[5], '', ''],
            antonymMeanings: [cells[6], '', '']
          });
        }
      }
    }
  });

  return rows;
};

export const SynonymAntonymEditor = ({ questions }: SynonymAntonymEditorProps) => {
  const [tableData, setTableData] = useState<QuestionData[]>(() => 
    questions.map((question, index) => ({
      number: question.questionNumber,
      rows: parseQuestionContent(question.content)
    }))
  );

  const analyzeWord = async (word: string) => {
    try {
      const response = await fetch('/functions/analyze-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze word');
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing word:', error);
      return null;
    }
  };

  const handleCellChange = async (
    questionIndex: number,
    rowIndex: number,
    field: keyof TableRowData,
    value: string | number,
    subIndex?: number
  ) => {
    setTableData(prev => {
      const newData = [...prev];
      const question = { ...newData[questionIndex] };
      const row = { ...question.rows[rowIndex] };

      if (field === 'headword' && typeof value === 'string' && value !== row.headword) {
        // Analyze the new headword using Claude API
        analyzeWord(value).then(analysis => {
          if (analysis) {
            setTableData(current => {
              const updatedData = [...current];
              const updatedQuestion = { ...updatedData[questionIndex] };
              const updatedRow = { ...updatedQuestion.rows[rowIndex] };
              
              updatedRow.partOfSpeech = analysis.partOfSpeech;
              updatedRow.example = `${analysis.example}\n${analysis.exampleTranslation}`;
              updatedRow.difficulty = analysis.difficulty;
              updatedRow.meaning = analysis.meaning;
              
              updatedQuestion.rows[rowIndex] = updatedRow;
              updatedData[questionIndex] = updatedQuestion;
              return updatedData;
            });
          }
        });
      }

      if (Array.isArray(row[field]) && typeof subIndex === 'number') {
        (row[field] as string[])[subIndex] = value as string;
      } else if (!Array.isArray(value)) {
        (row[field] as string | number) = value;
      }

      question.rows[rowIndex] = row;
      newData[questionIndex] = question;
      return newData;
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          동반어 단어장 제작
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            동반어 단어장 제작
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 p-4">
          {tableData.map((question, questionIndex) => (
            <VocabularyTable
              key={questionIndex}
              question={question}
              questionIndex={questionIndex}
              onCellChange={handleCellChange}
            />
          ))}
          
          <ExportToolbar
            onExportExcel={() => {}}
            onExportDoc={() => {}}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
