import { useQuery } from "@tanstack/react-query";
import { byIdMap } from "./engine";
import type { Bank, Cat } from "./types";
import bankAsset from "@/assets/bank-data.json.asset.json";

export function useBank() {
  const q = useQuery({
    queryKey: ["bank"],
    queryFn: async (): Promise<Bank> => {
      const res = await fetch(bankAsset.url);
      if (!res.ok) throw new Error("문제은행을 불러오지 못했습니다");
      return res.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const bank = q.data;
  const byId: Record<string, Cat> = bank ? byIdMap(bank) : {};
  return { bank, byId, isLoading: q.isLoading, error: q.error as Error | null };
}
