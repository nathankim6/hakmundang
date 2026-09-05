import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ExamPeriod = {
  id: string;
  name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  sort_order: number;
};

/** KST date as YYYY-MM-DD */
function todayKstISO(): string {
  const now = new Date();
  // KST = UTC+9
  const kst = new Date(now.getTime() + (9 * 60 - now.getTimezoneOffset()) * 60000);
  return kst.toISOString().slice(0, 10);
}

/** Convert YYYY-MM-DD (KST) → ISO timestamp at start of day KST */
export function kstDateStartISO(d: string): string {
  return new Date(`${d}T00:00:00+09:00`).toISOString();
}
/** Convert YYYY-MM-DD (KST) → ISO timestamp at end of day KST (exclusive next-day) */
export function kstDateEndISO(d: string): string {
  const [y, m, day] = d.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, day + 1));
  return new Date(`${next.toISOString().slice(0, 10)}T00:00:00+09:00`).toISOString();
}

export function useCurrentExamPeriod() {
  return useQuery({
    queryKey: ["exam-period", "current"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<ExamPeriod | null> => {
      const today = todayKstISO();
      const { data, error } = await supabase
        .from("exam_periods")
        .select("id,name,start_date,end_date,sort_order")
        .lte("start_date", today)
        .gte("end_date", today)
        .order("sort_order")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useAllExamPeriods() {
  return useQuery({
    queryKey: ["exam-period", "all"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<ExamPeriod[]> => {
      const { data, error } = await supabase
        .from("exam_periods")
        .select("id,name,start_date,end_date,sort_order")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}
