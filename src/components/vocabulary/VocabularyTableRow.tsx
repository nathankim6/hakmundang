import React from 'react';
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { Star } from "lucide-react";
import { TableRowData } from './types';

interface VocabularyTableRowProps {
  row: TableRowData;
  onCellChange: (field: keyof TableRowData, value: string | number, subIndex?: number) => void;
}

export const VocabularyTableRow = ({ row, onCellChange }: VocabularyTableRowProps) => {
  return (
    <TableRow className="hover:bg-slate-50/50">
      <TableCell className="align-top">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={row.headword}
              onChange={(e) => onCellChange('headword', e.target.value)}
              className="font-medium border-slate-200 focus:border-blue-400"
            />
            <div className="flex -space-x-1">
              {[...Array(row.difficulty || 1)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
          </div>
          <Input
            value={row.partOfSpeech}
            onChange={(e) => onCellChange('partOfSpeech', e.target.value)}
            placeholder="품사 (예: n., v., adj.)"
            className="text-sm border-slate-200 focus:border-blue-400"
          />
          <Input
            value={row.example || ''}
            onChange={(e) => onCellChange('example', e.target.value)}
            placeholder="예문 입력..."
            className="text-sm italic border-slate-200 focus:border-blue-400"
          />
          <select
            value={row.difficulty}
            onChange={(e) => onCellChange('difficulty', parseInt(e.target.value))}
            className="w-full text-sm border rounded-md border-slate-200 focus:border-blue-400 p-2"
          >
            <option value={1}>난이도: ★</option>
            <option value={2}>난이도: ★★</option>
            <option value={3}>난이도: ★★★</option>
          </select>
        </div>
      </TableCell>
      <TableCell className="align-top">
        <Input
          value={row.meaning}
          onChange={(e) => onCellChange('meaning', e.target.value)}
          className="border-slate-200 focus:border-blue-400"
        />
      </TableCell>
      <TableCell className="align-top space-y-2">
        {[0, 1, 2].map((index) => (
          <Input
            key={index}
            value={row.synonyms[index] || ''}
            onChange={(e) => onCellChange('synonyms', e.target.value, index)}
            placeholder={index === 0 ? '' : '추가 동의어...'}
            className={`border-slate-200 focus:border-blue-400 ${index === 0 ? '' : 'text-slate-500'}`}
          />
        ))}
      </TableCell>
      <TableCell className="align-top space-y-2">
        {[0, 1, 2].map((index) => (
          <Input
            key={index}
            value={row.synonymMeanings[index] || ''}
            onChange={(e) => onCellChange('synonymMeanings', e.target.value, index)}
            placeholder={index === 0 ? '' : '추가 동의어 뜻...'}
            className={`border-slate-200 focus:border-blue-400 ${index === 0 ? '' : 'text-slate-500'}`}
          />
        ))}
      </TableCell>
      <TableCell className="align-top space-y-2">
        {[0, 1, 2].map((index) => (
          <Input
            key={index}
            value={row.antonyms[index] || ''}
            onChange={(e) => onCellChange('antonyms', e.target.value, index)}
            placeholder={index === 0 ? '' : '추가 반의어...'}
            className={`border-slate-200 focus:border-blue-400 ${index === 0 ? '' : 'text-slate-500'}`}
          />
        ))}
      </TableCell>
      <TableCell className="align-top space-y-2">
        {[0, 1, 2].map((index) => (
          <Input
            key={index}
            value={row.antonymMeanings[index] || ''}
            onChange={(e) => onCellChange('antonymMeanings', e.target.value, index)}
            placeholder={index === 0 ? '' : '추가 반의어 뜻...'}
            className={`border-slate-200 focus:border-blue-400 ${index === 0 ? '' : 'text-slate-500'}`}
          />
        ))}
      </TableCell>
    </TableRow>
  );
};