
import { supabase, SUPABASE_PUBLIC_URL, SUPABASE_PUBLIC_KEY } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Passage } from "./PassageInput";
import { useMyWorksService, SaveWorkParams } from "@/components/my-works/MyWorksService";

export interface KeywordItem {
  english: string;
  korean: string;
}

export interface AnalysisResult {
  passageNumber: number;
  theme: string;
  lines: Array<{
    english: string;
    korean: string;
  }>;
  keywords: KeywordItem[];
  error?: string;
}

export interface AnalysisServiceProps {
  passages: Passage[];
  apiKey: string;
  onSuccess: (results: AnalysisResult[]) => void;
  onStartLoading: () => void;
  onStopLoading: () => void;
  openApiKeyDialog: () => void;
}

export const useAnalysisService = () => {
  const { toast } = useToast();
  const { saveWork } = useMyWorksService();

  const translateWithGPT = async (englishText: string, apiKey: string): Promise<string> => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: '당신은 영어를 한국어로 번역하는 번역기입니다. 문장을 "~했다", "~이다" 형태로 직역하세요. 자연스러운 의역보다는 원문에 충실한 직역을 해주세요.' 
            },
            { role: 'user', content: `다음 영어를 한국어로 번역해주세요: "${englishText}"` }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('번역 요청 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error("Translation error:", error);
      throw new Error('번역 중 오류가 발생했습니다.');
    }
  };

  const analyzePassages = async ({
    passages,
    apiKey,
    onSuccess,
    onStartLoading,
    onStopLoading,
    openApiKeyDialog
  }: AnalysisServiceProps) => {
    if (passages.some(p => !p.englishText)) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "모든 지문의 영어 텍스트를 입력해주세요."
      });
      return;
    }

    if (!apiKey) {
      toast({
        variant: "destructive",
        title: "API 키 필요",
        description: "분석을 시작하기 전에 OpenAI API 키를 설정해주세요."
      });
      openApiKeyDialog();
      return;
    }

    onStartLoading();

    try {
      // Process passages with empty Korean translations
      const processedPassages = [...passages];
      const translationPromises = [];

      for (let i = 0; i < processedPassages.length; i++) {
        if (!processedPassages[i].koreanText.trim()) {
          translationPromises.push(
            translateWithGPT(processedPassages[i].englishText, apiKey)
              .then(translation => {
                processedPassages[i].koreanText = translation;
                return i; // Return index for logging
              })
              .catch(error => {
                console.error(`Failed to translate passage ${i + 1}:`, error);
                toast({
                  variant: "destructive",
                  title: `지문 ${i + 1} 번역 실패`,
                  description: error instanceof Error ? error.message : "번역 중 오류가 발생했습니다."
                });
                return null;
              })
          );
        }
      }

      // Wait for all translations to complete
      if (translationPromises.length > 0) {
        const results = await Promise.all(translationPromises);
        const successCount = results.filter(r => r !== null).length;
        
        if (successCount > 0) {
          toast({
            title: "자동 번역 완료",
            description: `${successCount}개의 빈 한글 번역이 자동으로 생성되었습니다.`
          });
        }
      }

      const formattedPassages = processedPassages.map(p => ({
        englishText: p.englishText,
        koreanText: p.koreanText,
        passageNumber: p.id
      }));

      // Use direct fetch instead of supabase.functions.invoke to have more control over error handling
      console.log("Making direct call to edge function with passages:", formattedPassages.length);
      
      try {
        const response = await fetch(`${SUPABASE_PUBLIC_URL}/functions/v1/analyze-passage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_PUBLIC_KEY}`,
            'apikey': SUPABASE_PUBLIC_KEY
          },
          body: JSON.stringify({
            passages: formattedPassages,
            apiKey: apiKey
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Edge function response error:", errorText);
          throw new Error(errorText || '분석 중 오류가 발생했습니다.');
        }

        const results = await response.json();
        
        // Save results to user_works table
        const accessCode = localStorage.getItem('accessCode');
        if (accessCode) {
          for (const result of results) {
            if (!result.error) {
              const passage = processedPassages.find(p => p.id === result.passageNumber);
              if (passage) {
                const content = `${passage.englishText}\n\n${passage.koreanText}`;
                const resultText = JSON.stringify(result);
                
                // Save the work
                await saveWork({
                  accessCode,
                  stepNumber: 1,
                  stepName: '한줄해석',
                  title: `지문 ${result.passageNumber} 분석`,
                  content,
                  result: resultText
                });
              }
            }
          }
        }

        onSuccess(results);
        toast({
          title: "분석 완료",
          description: `${results.length}개의 지문 분석이 완료되었습니다.`
        });
      } catch (error) {
        console.error("Error calling analyze-passage edge function:", error);
        throw error;
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        variant: "destructive",
        title: "분석 오류",
        description: error instanceof Error ? error.message : "지문을 분석하는 중 오류가 발생했습니다."
      });
    } finally {
      onStopLoading();
    }
  };

  return { analyzePassages };
};
