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
                  partOfSpeech: analysis.partOfSpeech,
                  example: analysis.example,
                  exampleTranslation: analysis.exampleTranslation,
                  difficulty: analysis.difficulty,
                  meaning: analysis.meaning
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
    <div className="grid gap-8 print:gap-4">
      {analyzedQuestions.map((question, index) => (
        <div key={index} className="space-y-4">
          <h3 className="text-xl font-bold text-purple-600 print:text-black">
            [문제 {question.number}]
          </h3>
          <div className="grid gap-4 print:gap-2">
            {question.rows.map((row, rowIndex) => (
              <VocabularyCard key={rowIndex} word={row} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};