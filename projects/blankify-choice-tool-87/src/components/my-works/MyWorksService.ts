
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserWork {
  id: string;
  access_code: string;
  step_number: number;
  step_name: string;
  title: string | null;
  content: string;
  result: string;
  created_at: string;
  updated_at: string;
}

export interface SaveWorkParams {
  accessCode: string;
  stepNumber: number;
  stepName: string;
  title?: string;
  content: string;
  result: string;
}

export const useMyWorksService = () => {
  const { toast } = useToast();

  const saveWork = async (params: SaveWorkParams) => {
    try {
      console.log("Saving work with access code:", params.accessCode);
      
      const { data, error } = await supabase.from('user_works').insert({
        access_code: params.accessCode,
        step_number: params.stepNumber,
        step_name: params.stepName,
        title: params.title || null,
        content: params.content,
        result: params.result
      }).select();

      if (error) {
        console.error("Supabase error saving work:", error);
        throw error;
      }

      toast({
        title: "저장 완료",
        description: "작업이 성공적으로 저장되었습니다."
      });

      return true;
    } catch (error) {
      console.error("Error saving work:", error);
      toast({
        variant: "destructive",
        title: "저장 오류",
        description: "작업 저장 중 오류가 발생했습니다. 다시 시도해주세요."
      });
      return false;
    }
  };

  const fetchWorksByAccessCode = async (accessCode: string) => {
    try {
      console.log("Fetching works with service function for access code:", accessCode);
      
      const { data, error } = await supabase
        .from('user_works')
        .select('*')
        .eq('access_code', accessCode)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase error fetching works:", error);
        throw error;
      }

      console.log("Successfully fetched works via service:", data?.length || 0);
      return data as UserWork[];
    } catch (error) {
      console.error("Error fetching works:", error);
      toast({
        variant: "destructive",
        title: "데이터 불러오기 오류",
        description: "저장된 작업을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요."
      });
      return [];
    }
  };

  const deleteWork = async (id: string) => {
    try {
      console.log(`Attempting to delete work with ID: ${id}`);
      
      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error("Invalid ID provided for deletion");
      }
      
      const { error, status } = await supabase
        .from('user_works')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Supabase error deleting work:", error);
        throw error;
      }
      
      if (status >= 400) {
        throw new Error(`Unexpected status code: ${status}`);
      }
      
      console.log(`Successfully deleted work with ID: ${id}`);
      
      toast({
        title: "삭제 완료",
        description: "작업이 성공적으로 삭제되었습니다."
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting work:", error);
      toast({
        variant: "destructive",
        title: "삭제 오류",
        description: "작업 삭제 중 오류가 발생했습니다. 다시 시도해주세요."
      });
      return false;
    }
  };

  return { saveWork, fetchWorksByAccessCode, deleteWork };
};
