
import { useToast } from '@/hooks/use-toast';
import { supabase, SUPABASE_PUBLIC_URL, SUPABASE_PUBLIC_KEY } from "@/integrations/supabase/client";
import { useMyWorksService } from "@/components/my-works/MyWorksService";

export interface PassageItem {
  id: number;
  content: string;
}

export interface UnderstandingServiceProps {
  passages: PassageItem[];
  apiKey: string;
  onSuccess: (results: { id: number; content: string; result: string }[]) => void;
  onStartLoading: () => void;
  onStopLoading: () => void;
  openApiKeyDialog: () => void;
}

export const useUnderstandingService = () => {
  const { toast } = useToast();
  const { saveWork } = useMyWorksService();

  const generateUnderstanding = async ({
    passages,
    apiKey,
    onSuccess,
    onStartLoading,
    onStopLoading,
    openApiKeyDialog
  }: UnderstandingServiceProps) => {
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
      console.log(`Sending ${validPassages.length} passages to generate-understanding function`);
      
      // Process passages in parallel
      const results = await Promise.all(
        validPassages.map(async (passage) => {
          try {
            // Use direct fetch to invoke the edge function with proper headers
            const functionUrl = `${SUPABASE_PUBLIC_URL}/functions/v1/generate-understanding`;
            
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

            if (data.result) {
              // Save the result to user_works
              const accessCode = localStorage.getItem('accessCode');
              if (accessCode) {
                await saveWork({
                  accessCode,
                  stepNumber: 2,
                  stepName: '지문 이해',
                  title: `지문 ${passage.id} 이해 자료`,
                  content: passage.content,
                  result: data.result
                });
              }
              
              return {
                id: passage.id,
                content: passage.content,
                result: data.result
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
              result: `오류: ${error instanceof Error ? error.message : "이해 자료 생성 중 오류가 발생했습니다."}`
            };
          }
        })
      );

      onSuccess(results);
    } catch (error) {
      console.error("Generate understanding error:", error);
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "이해 자료 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      onStopLoading();
    }
  };

  return { generateUnderstanding };
};
