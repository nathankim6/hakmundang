import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Holiday } from "@/types/calendar";
import { useToast } from "@/hooks/use-toast";

export const useHolidays = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: holidays = [] } = useQuery({
    queryKey: ['holidays'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching holidays:', error);
        return [];
      }

      return data as Holiday[];
    }
  });

  const addHolidayMutation = useMutation({
    mutationFn: async (holiday: Omit<Holiday, 'id'>) => {
      const { error } = await supabase
        .from('holidays')
        .insert([holiday]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast({
        title: "공휴일이 추가되었습니다",
      });
    },
    onError: (error) => {
      toast({
        title: "공휴일 추가 중 오류가 발생했습니다",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeHolidayMutation = useMutation({
    mutationFn: async (holidayId: string) => {
      const { error } = await supabase
        .from('holidays')
        .delete()
        .eq('id', holidayId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast({
        title: "공휴일이 삭제되었습니다",
      });
    },
    onError: (error) => {
      toast({
        title: "공휴일 삭제 중 오류가 발생했습니다",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    holidays,
    addHoliday: addHolidayMutation.mutate,
    removeHoliday: removeHolidayMutation.mutate,
  };
};