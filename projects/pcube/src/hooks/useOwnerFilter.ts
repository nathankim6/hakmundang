import { useAuth } from "@/contexts/AuthContext";

/**
 * 선생님별 데이터 격리를 위한 소유자 필터링 훅.
 * - 슈퍼관리자(isAdmin)는 모든 데이터를 볼 수 있음
 * - 일반 선생님은 자기가 만든 데이터만 볼 수 있음
 */
export function useOwnerFilter() {
  const { session } = useAuth();

  const ownerCodeId = session?.accessCodeId || null;
  const isAdmin = session?.isAdmin || false;

  return {
    ownerCodeId,
    isAdmin,
    /** 소유자 필터가 필요한지 여부 (admin이 아닌 경우에만 필요) */
    shouldFilter: !isAdmin && !!ownerCodeId,
  };
}
