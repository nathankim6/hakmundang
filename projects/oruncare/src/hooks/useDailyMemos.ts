import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface DailyMemo {
  id: string;
  date: string;
  memo: string;
  created_at: string;
  updated_at: string;
}

export const useDailyMemos = () => {
  const queryClient = useQueryClient();

  const { data: memos = [], isLoading } = useQuery({
    queryKey: ['daily_memos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_memos')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return data as DailyMemo[];
    },
  });

  const addMemo = useMutation({
    mutationFn: async ({ date, memo }: { date: Date; memo: string }) => {
      const { data, error } = await supabase
        .from('daily_memos')
        .insert([
          {
            date: format(date, 'yyyy-MM-dd'),
            memo,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_memos'] });
    },
  });

  const updateMemo = useMutation({
    mutationFn: async ({ id, memo }: { id: string; memo: string }) => {
      const { data, error } = await supabase
        .from('daily_memos')
        .update({ memo })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_memos'] });
    },
  });

  const deleteMemo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('daily_memos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_memos'] });
    },
  });

  return {
    memos,
    isLoading,
    addMemo,
    updateMemo,
    deleteMemo,
  };
};