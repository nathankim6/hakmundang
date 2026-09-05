import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExamFile {
  id: string;
  school: string;
  grade: string;
  exam_year: string;
  semester: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

export const useExamFiles = () => {
  return useQuery({
    queryKey: ["exam-files"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("past_exam_files")
        .select("*")
        .order("exam_year", { ascending: false })
        .order("semester", { ascending: false });

      if (error) throw error;
      return data as ExamFile[];
    },
  });
};

export const useUploadExamFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      school,
      grade,
      exam_year,
      semester,
    }: {
      file: File;
      school: string;
      grade: string;
      exam_year: string;
      semester: string;
    }) => {
      const fileExt = file.name.split(".").pop() || "bin";
      // Strictly sanitize path segments to ASCII-safe characters
      const normalize = (s: string) =>
        s
          .normalize('NFKD')
          .replace(/[^\w.-]+/g, "_")
          .replace(/_+/g, "_")
          .replace(/^_+|_+$/g, "");
      const sanitizedSchool = normalize(school);
      const sanitizedGrade = normalize(grade);
      const sanitizedYear = normalize(exam_year);
      const sanitizedSemester = normalize(semester);
      
      const fileName = `${sanitizedSchool}_${sanitizedGrade}_${sanitizedYear}_${sanitizedSemester}_${Date.now()}.${fileExt}`;
      const filePath = `${sanitizedSchool}/${sanitizedGrade}/${sanitizedYear}/${sanitizedSemester}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("past_exams")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data, error: dbError } = await supabase
        .from("past_exam_files")
        .insert({
          school,
          grade,
          exam_year,
          semester,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-files"] });
      toast.success("기출문제가 업로드되었습니다");
    },
    onError: (error) => {
      toast.error("업로드 실패: " + error.message);
    },
  });
};

export const useDeleteExamFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file_path }: { id: string; file_path: string }) => {
      const { error: storageError } = await supabase.storage
        .from("past_exams")
        .remove([file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("past_exam_files")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-files"] });
      toast.success("기출문제가 삭제되었습니다");
    },
    onError: (error) => {
      toast.error("삭제 실패: " + error.message);
    },
  });
};