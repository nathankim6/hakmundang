import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from 'xlsx';
import { generateDocument } from "@/utils/documentGenerator";

interface TableRow {
  headword: string;
  meaning: string;
  synonyms: string[];
  synonymMeanings: string[];
  antonyms: string[];
  antonymMeanings: string[];
}

interface Question {
  id: string;
  content: string;
  questionNumber: number;
}

interface SynonymAntonymEditorProps {
  questions: Question[];
}

const parseQuestionContent = (content: string): TableRow[] => {
  const rows: TableRow[] = [];
  const lines = content.split('\n');
  let currentRow: Partial<TableRow> = {};

  lines.forEach(line => {
    if (line.includes('|')) {
      const cells = line.split('|').map(cell => cell.trim());
      if (cells.length >= 7 && !line.includes('-----')) {
        if (cells[1] && cells[1] !== '표제어') {
          rows.push({
            headword: cells[1],
            meaning: cells[2],
            synonyms: [cells[3]],
            synonymMeanings: [cells[4]],
            antonyms: [cells[5]],
            antonymMeanings: [cells[6]]
          });
        }
      }
    }
  });

  return rows;
};

export const SynonymAntonymEditor = ({ questions }: SynonymAntonymEditorProps) => {
  const [tableData, setTableData] = useState<{ number: number; rows: TableRow[] }[]>(() => 
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
    field: keyof TableRow,
    value: string | string[],
    subIndex?: number
  ) => {
    setTableData(prev => {
      const newData = [...prev];
      const question = { ...newData[questionIndex] };
      const row = { ...question.rows[rowIndex] };

      if (Array.isArray(row[field]) && typeof subIndex === 'number') {
        (row[field] as string[])[subIndex] = value as string;
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
          row.synonyms.join('\n'),
          row.synonymMeanings.join('\n'),
          row.antonyms.join('\n'),
          row.antonymMeanings.join('\n')
        ])
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(workbook, ws, `문제 ${question.number}`);
    });
    
    XLSX.writeFile(workbook, 'synonym_antonym_tables.xlsx');
  };

  const formatTableToString = (question: { number: number; rows: TableRow[] }) => {
    return `[문제 ${question.number}]\n\n` + 
      '| 표제어 | 표제어뜻 | 동의어 | 동의어뜻 | 반의어 | 반의어뜻 |\n' +
      '|--------|----------|--------|----------|--------|----------|\n' +
      question.rows.map(row => 
        `| ${row.headword} | ${row.meaning} | ${row.synonyms.join(', ')} | ${row.synonymMeanings.join(', ')} | ${row.antonyms.join(', ')} | ${row.antonymMeanings.join(', ')} |`
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
          동의어/반의어 표 편집
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>동의어/반의어 표 편집</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {tableData.map((question, questionIndex) => (
            <div key={questionIndex} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">문제</span>
                <Input
                  type="number"
                  value={question.number}
                  onChange={(e) => handleQuestionNumberChange(questionIndex, parseInt(e.target.value))}
                  className="w-20"
                />
              </div>
              
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">표제어</TableHead>
                      <TableHead className="w-[150px]">표제어뜻</TableHead>
                      <TableHead className="w-[200px]">동의어</TableHead>
                      <TableHead className="w-[200px]">동의어뜻</TableHead>
                      <TableHead className="w-[200px]">반의어</TableHead>
                      <TableHead className="w-[200px]">반의어뜻</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {question.rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        <TableCell>
                          <Input
                            value={row.headword}
                            onChange={(e) => handleCellChange(questionIndex, rowIndex, 'headword', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.meaning}
                            onChange={(e) => handleCellChange(questionIndex, rowIndex, 'meaning', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          {row.synonyms.map((syn, synIndex) => (
                            <Input
                              key={synIndex}
                              value={syn}
                              onChange={(e) => handleCellChange(questionIndex, rowIndex, 'synonyms', e.target.value, synIndex)}
                              className="mb-1"
                            />
                          ))}
                        </TableCell>
                        <TableCell>
                          {row.synonymMeanings.map((meaning, meaningIndex) => (
                            <Input
                              key={meaningIndex}
                              value={meaning}
                              onChange={(e) => handleCellChange(questionIndex, rowIndex, 'synonymMeanings', e.target.value, meaningIndex)}
                              className="mb-1"
                            />
                          ))}
                        </TableCell>
                        <TableCell>
                          {row.antonyms.map((ant, antIndex) => (
                            <Input
                              key={antIndex}
                              value={ant}
                              onChange={(e) => handleCellChange(questionIndex, rowIndex, 'antonyms', e.target.value, antIndex)}
                              className="mb-1"
                            />
                          ))}
                        </TableCell>
                        <TableCell>
                          {row.antonymMeanings.map((meaning, meaningIndex) => (
                            <Input
                              key={meaningIndex}
                              value={meaning}
                              onChange={(e) => handleCellChange(questionIndex, rowIndex, 'antonymMeanings', e.target.value, meaningIndex)}
                              className="mb-1"
                            />
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end gap-2">
            <Button onClick={exportToExcel} variant="outline">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel로 저장
            </Button>
            <Button onClick={exportToDoc} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Word로 저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
