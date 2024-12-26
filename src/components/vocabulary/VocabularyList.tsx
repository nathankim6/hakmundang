import React, { useEffect, useState } from 'react';
import { VocabularyCard } from './VocabularyCard';
import { QuestionData, TableRowData } from './types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface VocabularyListProps {
  questions: QuestionData[];
}

export const VocabularyList = ({ questions }: VocabularyListProps) => {
  const [analyzedQuestions, setAnalyzedQuestions] = useState(questions);
  const { toast } = useToast();

  useEffect(() => {
    const analyzeAllWords = async () => {
      const updatedQuestions = [...questions];
      
      for (const question of updatedQuestions) {
        for (let i = 0; i < question.rows.length; i++) {
          const row = question.rows[i];
          if (row.headword && !row.partOfSpeech) {
            try {
              const { data: analysis, error } = await supabase.functions.invoke('analyze-word', {
                body: { word: row.headword }
              });

              if (error) throw error;

              if (analysis) {
                question.rows[i] = {
                  ...row,
                  partOfSpeech: analysis.partOfSpeech || '[명사]',
                  example: analysis.example || '',
                  exampleTranslation: analysis.exampleTranslation || '',
                  difficulty: analysis.difficulty || 1,
                  meaning: analysis.meaning || row.meaning
                };
              }
            } catch (error) {
              console.error(`Error analyzing word ${row.headword}:`, error);
              toast({
                title: "단어 분석 오류",
                description: `${row.headword} 단어를 분석하는 중 오류가 발생했습니다.`,
                variant: "destructive",
              });
            }
          }
        }
      }
      
      setAnalyzedQuestions(updatedQuestions);
    };

    analyzeAllWords();
  }, [questions]);

  return (
    <div className="print:p-0 print:m-0">
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 1cm;
            }
            body {
              font-family: 'Noto Serif KR', serif;
            }
            .print-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 0.5rem;
            }
          }
        `}
      </style>
      <div className="grid gap-4 print:gap-2 print-grid">
        {analyzedQuestions.map((question, qIndex) => (
          <div key={qIndex} className="space-y-4 print:space-y-2">
            <div className="grid gap-4 print:gap-2">
              {question.rows.map((row, rowIndex) => (
                <VocabularyCard 
                  key={rowIndex} 
                  word={row}
                  showQuestionNumber={rowIndex === 0}
                  questionNumber={question.number}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};