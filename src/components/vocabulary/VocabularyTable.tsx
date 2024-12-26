import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VocabularyTableRow } from './VocabularyTableRow';
import { QuestionData, TableRowData } from './types';

interface VocabularyTableProps {
  question: QuestionData;
  questionIndex: number;
  onQuestionNumberChange: (questionIndex: number, newNumber: number) => void;
  onCellChange: (questionIndex: number, rowIndex: number, field: keyof TableRowData, value: string | number, subIndex?: number) => void;
}

export const VocabularyTable = ({ 
  question, 
  questionIndex, 
  onQuestionNumberChange,
  onCellChange 
}: VocabularyTableProps) => {
  return (
    <div className="space-y-4 bg-white rounded-lg shadow-lg p-6 border border-slate-200">
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-bold text-blue-600">[문제 {question.number}]</h3>
      </div>
      
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
              <TableHead className="w-[250px] font-semibold text-blue-700">표제어</TableHead>
              <TableHead className="w-[150px] font-semibold text-blue-700">표제어뜻</TableHead>
              <TableHead className="w-[200px] font-semibold text-blue-700">동의어</TableHead>
              <TableHead className="w-[200px] font-semibold text-blue-700">동의어뜻</TableHead>
              <TableHead className="w-[200px] font-semibold text-blue-700">반의어</TableHead>
              <TableHead className="w-[200px] font-semibold text-blue-700">반의어뜻</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {question.rows.map((row, rowIndex) => (
              <VocabularyTableRow
                key={rowIndex}
                row={row}
                onCellChange={(field, value, subIndex) => 
                  onCellChange(questionIndex, rowIndex, field, value, subIndex)
                }
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};