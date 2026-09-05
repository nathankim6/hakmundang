import { supabase } from "@/integrations/supabase/client";

export const processVocabularyWithAPI = async (_apiKey: string, inputText: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('process-vocabulary', {
      body: { inputText },
    });

    if (error) {
      console.error('Edge Function Error:', error);
      throw new Error('단어 처리 중 오류가 발생했습니다.');
    }

    return data;
  } catch (error) {
    console.error('API 처리 중 오류:', error);
    throw error;
  }
};