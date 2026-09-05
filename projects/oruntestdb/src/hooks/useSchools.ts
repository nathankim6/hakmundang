import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface School {
  id: string;
  name: string;
  logo_path: string | null;
  created_at: string;
  updated_at: string;
}

export const useSchools = () => {
  const queryClient = useQueryClient();

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ["schools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as School[];
    },
  });

  const addSchool = useMutation({
    mutationFn: async (school: { name: string; logo_path: string | null }) => {
      const { data, error } = await supabase
        .from("schools")
        .insert([school])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast.success("학교가 추가되었습니다.");
    },
    onError: (error: any) => {
      toast.error("학교 추가 실패: " + error.message);
    },
  });

  const updateSchool = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<School> & { id: string }) => {
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
      toast.success("학교 정보가 수정되었습니다.");
    },
    onError: (error: any) => {
      toast.error("학교 수정 실패: " + error.message);
    },
  });

  const deleteSchool = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("schools")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast.success("학교가 삭제되었습니다.");
    },
    onError: (error: any) => {
      toast.error("학교 삭제 실패: " + error.message);
    },
  });

  return {
    schools,
    isLoading,
    addSchool,
    updateSchool,
    deleteSchool,
  };
};
