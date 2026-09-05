import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOwnerFilter } from "./useOwnerFilter";

/**
 * 현재 선생님 소유의 학생 ID 목록을 반환하는 훅.
 * schools(owner_code_id) → grades → students 체인으로 필터링.
 * 슈퍼관리자는 null을 반환 (필터링 불필요).
 */
export function useOwnerStudentIds() {
  const { ownerCodeId, isAdmin, shouldFilter } = useOwnerFilter();

  const { data: studentIds, isLoading } = useQuery({
    queryKey: ["owner-student-ids", ownerCodeId],
    enabled: shouldFilter,
    queryFn: async () => {
      // 선생님 소유 학교 조회
      const { data: schools } = await supabase
        .from("schools")
        .select("id")
        .eq("owner_code_id", ownerCodeId!);

      const schoolIds = schools?.map((s) => s.id) || [];
      if (schoolIds.length === 0) return [];

      // 해당 학교의 학년 조회
      const { data: grades } = await supabase
        .from("grades")
        .select("id")
        .in("school_id", schoolIds);

      const gradeIds = grades?.map((g) => g.id) || [];
      if (gradeIds.length === 0) return [];

      // 해당 학년의 학생 조회
      const { data: students } = await supabase
        .from("students")
        .select("id")
        .in("grade_id", gradeIds);

      return students?.map((s) => s.id) || [];
    },
  });

  return {
    /** null이면 필터링 불필요 (admin), 배열이면 해당 학생만 필터 */
    studentIds: shouldFilter ? (studentIds || []) : null,
    isAdmin,
    shouldFilter,
    isLoading: shouldFilter && isLoading,
  };
}
