
import { useToast } from '@/hooks/use-toast';
import { supabase, SUPABASE_PUBLIC_URL, SUPABASE_PUBLIC_KEY } from "@/integrations/supabase/client";
import { useMyWorksService } from "@/components/my-works/MyWorksService";

export interface SynonymPassage {
  id: number;
  content: string;
}

export interface WordData {
  keyword: string;
  keywordKorean: string;
  synonyms: string[];
  synonymsKorean: string;
  antonyms: string[];
  antonymsKorean: string;
}

export interface SynonymResult {
  id: number;
  content: string;
  words?: WordData[];
  synonyms?: string;
  error?: string;
}

export interface SynonymsServiceProps {
  passages: SynonymPassage[];
  apiKey: string;
  onSuccess: (results: SynonymResult[]) => void;
  onStartLoading: () => void;
  onStopLoading: () => void;
  openApiKeyDialog: () => void;
}

export const useSynonymsService = () => {
  const { toast } = useToast();
  const { saveWork } = useMyWorksService();

  const generateSynonyms = async ({
    passages,
    apiKey,
    onSuccess,
    onStartLoading,
    onStopLoading,
    openApiKeyDialog
  }: SynonymsServiceProps) => {
    const validPassages = passages.filter(p => p.content.trim());
    
    if (validPassages.length === 0) {
      toast({
        title: "오류",
        description: "지문을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "오류",
        description: "OpenAI API 키를 입력해주세요.",
        variant: "destructive",
      });
      openApiKeyDialog();
      return;
    }

    onStartLoading();

    try {
      console.log(`Sending ${validPassages.length} passages to generate-synonyms function`);
      
      // Process passages in parallel
      const results = await Promise.all(
        validPassages.map(async (passage) => {
          try {
            // Making direct fetch call with fixed URL and key values
            const response = await fetch(`${SUPABASE_PUBLIC_URL}/functions/v1/generate-synonyms`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_PUBLIC_KEY}`,
                'apikey': SUPABASE_PUBLIC_KEY
              },
              body: JSON.stringify({ 
                passage: passage.content,
                apiKey: apiKey 
              })
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error("Edge function error response:", errorText);
              throw new Error(errorText || '서버 오류');
            }

            const data = await response.json();

            if (data.result && data.result.words) {
              // Save to user_works
              const accessCode = localStorage.getItem('accessCode');
              if (accessCode) {
                await saveWork({
                  accessCode,
                  stepNumber: 4,
                  stepName: '동의어 추천',
                  title: `지문 ${passage.id} 동의어`,
                  content: passage.content,
                  result: JSON.stringify(data.result)
                });
              }
              
              return {
                id: passage.id,
                content: passage.content,
                words: data.result.words
              };
            } else {
              throw new Error("응답 데이터가 올바른 형식이 아닙니다.");
            }
          } catch (error) {
            console.error(`Error processing passage #${passage.id}:`, error);
            // Return error for this specific passage
            return {
              id: passage.id,
              content: passage.content,
              error: error instanceof Error ? error.message : "동의어 생성 중 오류가 발생했습니다."
            };
          }
        })
      );

      onSuccess(results);
    } catch (error) {
      console.error("Generate synonyms error:", error);
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "동의어 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      onStopLoading();
    }
  };

  return { generateSynonyms };
};
