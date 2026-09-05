import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AnswerStatus = "correct" | "wrong" | "partial";

export interface SubmissionAnswer {
  problem_id: string;
  status: AnswerStatus;
  reason?: string;
}

export interface StudentSubmission {
  id: string;
  report_id: string;
  school: string;
  grade: string;
  student_name: string;
  score: number | null;
  answers: SubmissionAnswer[];
  created_at: string;
}

export function useStudentSubmissions(reportId?: string) {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!reportId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("student_submissions")
      .select("*")
      .eq("report_id", reportId)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setSubmissions(
        data.map((d: any) => ({
          ...d,
          answers: Array.isArray(d.answers) ? d.answers : [],
        })) as StudentSubmission[]
      );
    }
    setLoading(false);
  }, [reportId]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(
    async (id: string) => {
      await supabase.from("student_submissions").delete().eq("id", id);
      await load();
    },
    [load]
  );

  return { submissions, loading, reload: load, remove };
}

export async function submitStudentAnswers(payload: {
  report_id: string;
  school: string;
  grade: string;
  student_name: string;
  score: number | null;
  answers: SubmissionAnswer[];
}) {
  const { data, error } = await supabase
    .from("student_submissions")
    .insert([payload as any])
    .select()
    .single();
  return { data, error };
}