
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay } from 'date-fns';

export const useManualClasses = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: manualClasses = [] } = useQuery({
    queryKey: ['manual_classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manual_classes')
        .select(`
          id,
          date,
          class:classes (
            id,
            name,
            teacher
          )
        `);

      if (error) throw error;
      return data;
    }
  });

  const addManualClass = useMutation({
    mutationFn: async ({ classId, date }: { classId: string, date: Date }) => {
      // startOfDay를 사용하여 시간을 00:00:00으로 설정
      const localDate = startOfDay(date);
      
      // 로컬 날짜를 'YYYY-MM-DD' 형식으로 변환
      const formattedDate = format(localDate, 'yyyy-MM-dd');
      
      console.log('Original date:', date);
      console.log('Local date:', localDate);
      console.log('Formatted date:', formattedDate);
      
      const { error } = await supabase
        .from('manual_classes')
        .insert({
          class_id: classId,
          date: formattedDate
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual_classes'] });
      toast({
        title: "수업이 추가되었습니다.",
      });
    },
    onError: (error) => {
      console.error('Error adding manual class:', error);
      toast({
        title: "수업 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  const deleteManualClass = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('manual_classes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual_classes'] });
      toast({
        title: "수업이 삭제되었습니다.",
      });
    },
    onError: (error) => {
      console.error('Error deleting manual class:', error);
      toast({
        title: "수업 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  return {
    manualClasses,
    addManualClass,
    deleteManualClass
  };
};
