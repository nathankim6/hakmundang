import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star } from "lucide-react";
import { QuestionData } from './types';

interface VocabularyTableProps {
  question: QuestionData;
  questionIndex: number;
}

export const VocabularyTable = ({ question, questionIndex }: VocabularyTableProps) => {
  return (
    <div className="space-y-4 bg-white rounded-lg shadow-lg p-6 border border-slate-200">
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-bold text-blue-600">[문제 {question.number}]</h3>
      </div>
      
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
              <TableHead className="w-[200px] font-semibold text-blue-700">표제어</TableHead>
              <TableHead className="w-[150px] font-semibold text-blue-700">표제어뜻</TableHead>
              <TableHead className="w-[200px] font-semibold text-blue-700">동의어</TableHead>
              <TableHead className="w-[200px] font-semibold text-blue-700">동의어뜻</TableHead>
              <TableHead className="w-[200px] font-semibold text-blue-700">반의어</TableHead>
              <TableHead className="w-[200px] font-semibold text-blue-700">반의어뜻</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {question.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-slate-50/50">
                <TableCell className="align-top">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{row.headword}</span>
                      <div className="flex -space-x-1">
                        {[...Array(row.difficulty || 1)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-yellow-400 fill-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                    {row.partOfSpeech && (
                      <span className="text-sm text-gray-600">{row.partOfSpeech}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <span className="text-gray-800">{row.meaning}</span>
                </TableCell>
                <TableCell className="align-top">
                  <div className="space-y-2">
                    {row.synonyms.map((synonym, index) => (
                      synonym && (
                        <div key={index} className="text-gray-800">
                          {synonym}
                        </div>
                      )
                    ))}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="space-y-2">
                    {row.synonymMeanings.map((meaning, index) => (
                      meaning && (
                        <div key={index} className="text-gray-600">
                          {meaning}
                        </div>
                      )
                    ))}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="space-y-2">
                    {row.antonyms.map((antonym, index) => (
                      antonym && (
                        <div key={index} className="text-gray-800">
                          {antonym}
                        </div>
                      )
                    ))}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="space-y-2">
                    {row.antonymMeanings.map((meaning, index) => (
                      meaning && (
                        <div key={index} className="text-gray-600">
                          {meaning}
                        </div>
                      )
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};