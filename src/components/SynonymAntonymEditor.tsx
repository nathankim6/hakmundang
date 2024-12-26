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

  const handleQuestionNumberChange = (questionIndex: number, newNumber: number) => {
    setTableData(prev => 
      prev.map((item, index) => 
        index === questionIndex ? { ...item, number: newNumber } : item
      )
    );
  };

  const handleCellChange = (
    questionIndex: number,
    rowIndex: number,
    field: keyof TableRowData,
    value: string,
    subIndex?: number
  ) => {
    setTableData(prev => {
      const newData = [...prev];
      const question = { ...newData[questionIndex] };
      const row = { ...question.rows[rowIndex] };

      if (Array.isArray(row[field]) && typeof subIndex === 'number') {
        (row[field] as string[])[subIndex] = value;
      } else if (!Array.isArray(value)) {
        (row[field] as string) = value;
      }

      question.rows[rowIndex] = row;
      newData[questionIndex] = question;
      return newData;
    });
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    tableData.forEach((question) => {
      const wsData = [
        ['문제 ' + question.number],
        ['표제어', '표제어뜻', '동의어', '동의어뜻', '반의어', '반의어뜻'],
        ...question.rows.map(row => [
          row.headword,
          row.meaning,
          row.synonyms.filter(Boolean).join('\n'),
          row.synonymMeanings.filter(Boolean).join('\n'),
          row.antonyms.filter(Boolean).join('\n'),
          row.antonymMeanings.filter(Boolean).join('\n')
        ])
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(workbook, ws, `문제 ${question.number}`);
    });
    
    XLSX.writeFile(workbook, 'synonym_antonym_tables.xlsx');
  };

  const formatTableToString = (question: QuestionData) => {
    return `[문제 ${question.number}]\n\n` + 
      '| 표제어 | 표제어뜻 | 동의어 | 동의어뜻 | 반의어 | 반의어뜻 |\n' +
      '|--------|----------|--------|----------|--------|----------|\n' +
      question.rows.map(row => 
        `| ${row.headword} | ${row.meaning} | ${row.synonyms.filter(Boolean).join(', ')} | ${row.synonymMeanings.filter(Boolean).join(', ')} | ${row.antonyms.filter(Boolean).join(', ')} | ${row.antonymMeanings.filter(Boolean).join(', ')} |`
      ).join('\n');
  };

  const exportToDoc = () => {
    const formattedQuestions = tableData.map(question => ({
      content: formatTableToString(question),
      questionNumber: question.number,
    }));
    
    generateDocument(formattedQuestions);
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
              onQuestionNumberChange={handleQuestionNumberChange}
              onCellChange={handleCellChange}
            />
          ))}
          
          <ExportToolbar
            onExportExcel={exportToExcel}
            onExportDoc={exportToDoc}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};