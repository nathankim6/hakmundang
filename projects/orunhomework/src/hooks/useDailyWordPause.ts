import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOwnerFilter } from "./useOwnerFilter";

interface DailyWordPauseSettingRow {
  key: string;
  value: string;
  updated_at: string;
}

interface DailyWordPauseState {
  isPaused: boolean;
  resumeDate: string | null;
  pauseStartedAt: string | null;
}

function mapDailyWordPauseState(data: DailyWordPauseSettingRow[] | null | undefined): DailyWordPauseState {
  const pausedRow = data?.find((setting) => setting.key === "daily_word_paused");
  const isPaused = pausedRow?.value === "true";
  const resumeDate = data?.find((setting) => setting.key === "daily_word_resume_date")?.value || null;
  const pauseStartedAt = isPaused ? pausedRow?.updated_at?.split("T")[0] || null : null;

  return {
    isPaused,
    resumeDate,
    pauseStartedAt,
  };
}

export function useDailyWordPause() {
  const { ownerCodeId } = useOwnerFilter();
  const queryClient = useQueryClient();

  const { data: pauseState, isLoading } = useQuery({
    queryKey: ["daily-word-pause", ownerCodeId],
    queryFn: async (): Promise<DailyWordPauseState> => {
      let query = supabase
        .from("app_settings")
        .select("key, value, updated_at")
        .in("key", ["daily_word_paused", "daily_word_resume_date"]);

      if (ownerCodeId) {
        query = query.eq("owner_code_id", ownerCodeId);
      } else {
        query = query.is("owner_code_id", null);
      }

      const { data } = await query;
      return mapDailyWordPauseState(data as DailyWordPauseSettingRow[] | null | undefined);
    },
    staleTime: 60000,
  });

  const upsertSetting = async (key: string, value: string) => {
    let query = supabase.from("app_settings").select("id").eq("key", key);
    if (ownerCodeId) {
      query = query.eq("owner_code_id", ownerCodeId);
    } else {
      query = query.is("owner_code_id", null);
    }
    const { data: existing } = await query.maybeSingle();

    if (existing) {
      await supabase.from("app_settings").update({ value, updated_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      const insertData: { key: string; value: string; owner_code_id?: string } = { key, value };
      if (ownerCodeId) insertData.owner_code_id = ownerCodeId;
      await supabase.from("app_settings").insert(insertData);
    }
  };

  const pauseDailyWord = async (_ownedStudentIds: string[]) => {
    // 기존 dismissed_daily_words(과제없음) 기록은 보존 — 제출 기록도 보존
    // paused 플래그만 설정하여 새로운 과제 생성만 중단
    await upsertSetting("daily_word_paused", "true");

    queryClient.invalidateQueries({ queryKey: ["daily-word-pause"] });
    queryClient.invalidateQueries({ queryKey: ["daily-submissions-only"] });
    queryClient.invalidateQueries({ queryKey: ["unreviewed-submissions-all"] });
    queryClient.invalidateQueries({ queryKey: ["all-missing-assignments"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    queryClient.invalidateQueries({ queryKey: ["missed-daily-words"] });
  };

  const resumeDailyWord = async () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    await upsertSetting("daily_word_paused", "false");
    await upsertSetting("daily_word_resume_date", todayStr);

    queryClient.invalidateQueries({ queryKey: ["daily-word-pause"] });
    queryClient.invalidateQueries({ queryKey: ["all-missing-assignments"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    queryClient.invalidateQueries({ queryKey: ["missed-daily-words"] });
  };

  return {
    isPaused: pauseState?.isPaused ?? false,
    resumeDate: pauseState?.resumeDate ?? null,
    pauseStartedAt: pauseState?.pauseStartedAt ?? null,
    isLoading,
    pauseDailyWord,
    resumeDailyWord,
  };
}

/**
 * Fetches the daily word pause state for a given owner (non-hook version for queries).
 */
export async function fetchDailyWordPauseState(ownerCodeId?: string | null): Promise<DailyWordPauseState> {
  let query = supabase
    .from("app_settings")
    .select("key, value, updated_at")
    .in("key", ["daily_word_paused", "daily_word_resume_date"]);

  if (ownerCodeId) {
    query = query.eq("owner_code_id", ownerCodeId);
  } else {
    query = query.is("owner_code_id", null);
  }

  const { data } = await query;
  return mapDailyWordPauseState(data as DailyWordPauseSettingRow[] | null | undefined);
}
