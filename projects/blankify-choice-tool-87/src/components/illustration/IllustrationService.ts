
import { useToast } from '@/hooks/use-toast';
import { supabase, SUPABASE_PUBLIC_URL, SUPABASE_PUBLIC_KEY } from "@/integrations/supabase/client";
import { useMyWorksService } from "@/components/my-works/MyWorksService";

export interface IllustrationPassage {
  id: number;
  content: string;
}

export interface IllustrationResult {
  id: number;
  content: string;
  imageUrl?: string;
  prompt?: string;
  analysis?: string;
  error?: string;
}

export interface IllustrationServiceProps {
  passages: IllustrationPassage[];
  apiKey: string;
  onSuccess: (results: IllustrationResult[]) => void;
  onStartLoading: () => void;
  onStopLoading: () => void;
  openApiKeyDialog: () => void;
}

export const useIllustrationService = () => {
  const { toast } = useToast();
  const { saveWork } = useMyWorksService();

  const generateIllustrations = async ({
    passages,
    apiKey,
    onSuccess,
    onStartLoading,
    onStopLoading,
    openApiKeyDialog
  }: IllustrationServiceProps) => {
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
      console.log(`${validPassages.length}개 지문에 대한 삽화 생성 요청 전송 중`);
      
      // Process passages in parallel
      const results = await Promise.all(
        validPassages.map(async (passage) => {
          try {
            // Use direct fetch to invoke the edge function with proper headers
            const functionUrl = `${SUPABASE_PUBLIC_URL}/functions/v1/generate-illustration`;
            
            const response = await fetch(functionUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_PUBLIC_KEY}`,
              },
              body: JSON.stringify({ 
                passage: passage.content,
                apiKey: apiKey 
              })
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || '서버 오류');
            }

            const data = await response.json();

            if (data.imageUrl) {
              // Save to user_works
              const accessCode = localStorage.getItem('accessCode');
              if (accessCode) {
                await saveWork({
                  accessCode,
                  stepNumber: 5,
                  stepName: '삽화 생성',
                  title: `지문 ${passage.id} 삽화`,
                  content: passage.content,
                  result: JSON.stringify({
                    imageUrl: data.imageUrl,
                    prompt: data.prompt,
                    analysis: data.analysis
                  })
                });
              }
              
              return {
                id: passage.id,
                content: passage.content,
                imageUrl: data.imageUrl,
                prompt: data.prompt,
                analysis: data.analysis
              };
            } else {
              throw new Error("응답 데이터가 올바른 형식이 아닙니다.");
            }
          } catch (error) {
            console.error(`지문 #${passage.id} 처리 중 오류:`, error);
            // Return error for this specific passage
            return {
              id: passage.id,
              content: passage.content,
              error: error instanceof Error ? error.message : "삽화 생성 중 오류가 발생했습니다."
            };
          }
        })
      );

      onSuccess(results);
    } catch (error) {
      console.error("삽화 생성 중 오류:", error);
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "삽화 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      onStopLoading();
    }
  };

  return { generateIllustrations };
};
