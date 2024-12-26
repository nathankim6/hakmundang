import React, { useEffect, useState } from 'react';
import { VocabularyCard } from './VocabularyCard';
import { QuestionData } from './types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface VocabularyListProps {
  questions: QuestionData[];
}

export const VocabularyList = ({ questions }: VocabularyListProps) => {
  const [analyzedQuestions, setAnalyzedQuestions] = useState(questions);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const analyzeAllWords = async () => {
      setIsAnalyzing(true);
      const updatedQuestions = [...questions];
      let hasError = false;
      
      for (const question of updatedQuestions) {
        for (let i = 0; i < question.rows.length; i++) {
          const row = question.rows[i];
          if (row.headword && !row.partOfSpeech) {
            try {
              console.log(`Analyzing word: ${row.headword}`);
              const { data: analysis, error } = await supabase.functions.invoke('analyze-word', {
                body: { word: row.headword }
              });

              if (error) {
                console.error(`Error analyzing word ${row.headword}:`, error);
                hasError = true;
                continue;
              }

              if (analysis) {
                question.rows[i] = {
                  ...row,
                  partOfSpeech: analysis.partOfSpeech || row.partOfSpeech,
                  example: analysis.example || row.example,
                  exampleTranslation: analysis.exampleTranslation || row.exampleTranslation,
                  difficulty: analysis.difficulty || row.difficulty || 1,
                  meaning: analysis.meaning || row.meaning
                };
                console.log(`Successfully analyzed word ${row.headword}:`, analysis);
              }
            } catch (error) {
              console.error(`Error analyzing word ${row.headword}:`, error);
              hasError = true;
              toast({
                title: "단어 분석 오류",
                description: `${row.headword} 단어를 분석하는 중 오류가 발생했습니다.`,
                variant: "destructive",
              });
            }
            // Add a small delay between requests to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (hasError) {
        toast({
          title: "일부 단어 분석 실패",
          description: "일부 단어의 분석이 실패했습니다. 나머지 단어는 정상적으로 처리되었습니다.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "분석 완료",
          description: "모든 단어가 성공적으로 분석되었습니다.",
        });
      }
      
      setAnalyzedQuestions(updatedQuestions);
      setIsAnalyzing(false);
    };

    if (questions.length > 0) {
      analyzeAllWords();
    }
  }, [questions]);

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-purple-600">단어를 분석하는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[210mm] mx-auto bg-white p-8 print:p-0 print:bg-white">
      <div className="grid gap-6 print:gap-4">
        {analyzedQuestions.map((question, index) => (
          <div key={index} className="space-y-3">
            <h3 className="text-xl font-bold text-purple-600 print:text-black border-b border-purple-200 pb-2 print:border-gray-300">
              [문제 {question.number}]
            </h3>
            <div className="grid gap-3 print:gap-2">
              {question.rows.map((row, rowIndex) => (
                <VocabularyCard key={rowIndex} word={row} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};