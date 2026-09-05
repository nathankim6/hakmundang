import { useAuth } from "@/contexts/AuthContext";

/**
 * 선생님별 데이터 격리를 위한 소유자 필터링 훅.
 * - 관리자 포함 모든 선생님은 자기가 만든 데이터만 볼 수 있음
 */
export function useOwnerFilter() {
  const { session } = useAuth();

  const ownerCodeId = session?.accessCodeId || null;
  const isAdmin = session?.isAdmin || false;

  return {
    ownerCodeId,
    isAdmin,
    /** 소유자 필터가 필요한지 여부 (관리자 포함 모든 선생님에게 적용) */
    shouldFilter: !!ownerCodeId,
  };
}
