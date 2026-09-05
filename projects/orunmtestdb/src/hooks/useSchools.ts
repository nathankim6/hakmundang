import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

export interface School {
  id: string;
  school_name: string;
  logo_path: string | null;
  created_at: string;
  updated_at: string;
}

export const useSchools = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('schools-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schools'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["schools"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["schools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .order("school_name");

      if (error) throw error;
      return data as School[];
    },
  });
};

export const useCreateSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (school: { school_name: string; logo_path?: string | null }) => {
      const { data, error } = await supabase
        .from("schools")
        .insert(school)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast({
        title: "학교 추가 완료",
        description: "학교가 성공적으로 추가되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "학교 추가 실패",
        description: error.message || "학교 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      school_name?: string;
      logo_path?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("schools")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast({
        title: "학교 수정 완료",
        description: "학교 정보가 성공적으로 수정되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "학교 수정 실패",
        description: error.message || "학교 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schools").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast({
        title: "학교 삭제 완료",
        description: "학교가 성공적으로 삭제되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "학교 삭제 실패",
        description: error.message || "학교 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });
};
