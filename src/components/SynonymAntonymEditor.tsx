import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generateDocument } from "@/utils/documentGenerator";
import { VocabularyTable } from './vocabulary/VocabularyTable';
import { ExportToolbar } from './vocabulary/ExportToolbar';
import { QuestionData, TableRowData } from './vocabulary/types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
  
  let currentRow: TableRowData | null = null;
  
  lines.forEach(line => {
    if (line.includes('|')) {
      const cells = line.split('|').map(cell => cell.trim());
      if (cells.length >= 7 && !line.includes('-----')) {
        // Skip header row
        if (cells[1] && cells[1] !== '표제어') {
          // Split multiple synonyms and antonyms by comma, semicolon, or newline
          const synonyms = cells[3].split(/[,;\n]/).map(s => s.trim()).filter(s => s);
          const synonymMeanings = cells[4].split(/[,;\n]/).map(s => s.trim()).filter(s => s);
          const antonyms = cells[5].split(/[,;\n]/).map(s => s.trim()).filter(s => s);
          const antonymMeanings = cells[6].split(/[,;\n]/).map(s => s.trim()).filter(s => s);

          // Create a row for each word
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
  const [tableData, setTableData] = useState<QuestionData[]>(() => 
    questions.map((question, index) => ({
      number: question.questionNumber,
      rows: parseQuestionContent(question.content)
    }))
  );
  const { toast } = useToast();

  // Analyze all headwords when component mounts
  useEffect(() => {
    const analyzeAllHeadwords = async () => {
      const updatedData = [...tableData];
      
      for (let questionIndex = 0; questionIndex < updatedData.length; questionIndex++) {
        const question = updatedData[questionIndex];
        for (let rowIndex = 0; rowIndex < question.rows.length; rowIndex++) {
          const row = question.rows[rowIndex];
          if (row.headword && !row.partOfSpeech) {
            try {
              const analysis = await analyzeWord(row.headword);
              if (analysis) {
                question.rows[rowIndex] = {
                  ...row,
                  partOfSpeech: analysis.partOfSpeech,
                  example: `${analysis.example}\n${analysis.exampleTranslation}`,
                  difficulty: analysis.difficulty,
                  meaning: analysis.meaning
                };
              }
            } catch (error) {
              console.error(`Error analyzing word ${row.headword}:`, error);
            }
          }
        }
      }
      
      setTableData(updatedData);
    };

    analyzeAllHeadwords();
  }, []);

  const analyzeWord = async (word: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-word', {
        body: { word }
      });

      if (error) {
        toast({
          title: "단어 분석 오류",
          description: "단어를 분석하는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
        throw error;
      }

      return data;
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
        toast({
          title: "단어 분석 중",
          description: "Claude API를 통해 단어를 분석하고 있습니다...",
        });

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

              toast({
                title: "단어 분석 완료",
                description: "단어 정보가 성공적으로 업데이트되었습니다.",
              });

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