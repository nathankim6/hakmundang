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
                  partOfSpeech: analysis.partOfSpeech || row.partOfSpeech,
                  example: analysis.example || row.example,
                  exampleTranslation: analysis.exampleTranslation || row.exampleTranslation,
                  difficulty: analysis.difficulty || row.difficulty || 1,
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
    <div className="grid gap-4 print:gap-2 @container">
      {analyzedQuestions.map((question, questionIndex) => (
        <div key={questionIndex} className="space-y-4 print:break-inside-avoid">
          <div className="grid gap-4 print:gap-2">
            {question.rows.map((row, rowIndex) => (
              <VocabularyCard 
                key={rowIndex} 
                word={row} 
                isFirstInQuestion={rowIndex === 0}
                questionNumber={rowIndex === 0 ? question.number : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};