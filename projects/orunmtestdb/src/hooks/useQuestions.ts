import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Question {
  id: string;
  school: string;
  grade: string;
  question_type: string;
  difficulty: string;
  title: string;
  content: string;
  answer: string;
  explanation: string | null;
  exam_year: string;
  semester: string;
  created_at: string;
  updated_at: string;
}

export const useQuestions = () => {
  return useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("questions")
        .select("*")
        .order("exam_year", { ascending: false });

      if (error) throw error;
      return data as Question[];
    },
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (question: Omit<Question, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await (supabase as any)
        .from("questions")
        .insert([question])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast({
        title: "문제 등록 완료",
        description: "새로운 문제가 등록되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description: "문제 등록에 실패했습니다.",
        variant: "destructive",
      });
      console.error("Create question error:", error);
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...question }: Partial<Question> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from("questions")
        .update(question)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast({
        title: "수정 완료",
        description: "문제가 수정되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description: "문제 수정에 실패했습니다.",
        variant: "destructive",
      });
      console.error("Update question error:", error);
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("questions").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast({
        title: "삭제 완료",
        description: "문제가 삭제되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description: "문제 삭제에 실패했습니다.",
        variant: "destructive",
      });
      console.error("Delete question error:", error);
    },
  });
};
