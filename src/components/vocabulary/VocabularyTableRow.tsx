import React from 'react';
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { TableRowData } from './types';

interface VocabularyTableRowProps {
  row: TableRowData;
  onCellChange: (field: keyof TableRowData, value: string, subIndex?: number) => void;
}

export const VocabularyTableRow = ({ row, onCellChange }: VocabularyTableRowProps) => {
  return (
    <TableRow className="hover:bg-slate-50/50">
      <TableCell className="align-top">
        <Input
          value={row.headword}
          onChange={(e) => onCellChange('headword', e.target.value)}
          className="font-medium border-slate-200 focus:border-blue-400"
        />
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