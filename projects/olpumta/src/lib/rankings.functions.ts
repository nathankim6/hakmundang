import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type GlobalRankRow = {
  id: string;
  display_name: string;
  full_name: string | null;
  avatar_emoji: string;
  avatar_url: string | null;
  character_type: string | null;
  character_exp: number;
  campus: string | null;
  class_name: string | null;
  school: string | null;
  grade: string | null;
  total: number;
  cats: { math: number; english: number; korean: number; explore: number };
};

function classify(name: string): "math" | "english" | "korean" | "explore" {
  const n = (name ?? "").replace(/\s+/g, "");
  if (n.includes("수학")) return "math";
  if (n.includes("영어")) return "english";
  if (n.includes("국어")) return "korean";
  return "explore";
}

export const getGlobalRanking = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { periodId: string | null }) =>
    z.object({ periodId: z.string().uuid().nullable() }).parse(input),
  )
  .handler(async ({ data }): Promise<GlobalRankRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (!data.periodId) return [];

    // 모든 프로필
    const { data: profiles, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select(
        "id,display_name,avatar_emoji,avatar_url,character_type,character_exp,campus,class_name,full_name,school,grade",
      );
    if (pErr) throw new Error(pErr.message);

    // 해당 시즌의 모든 세션 (RLS 우회)
    const { data: sessions, error: sErr } = await supabaseAdmin
      .from("study_sessions")
      .select("user_id,subject_id,duration_seconds")
      .eq("period_id", data.periodId);
    if (sErr) throw new Error(sErr.message);

    // 모든 과목
    const { data: subjects, error: subErr } = await supabaseAdmin
      .from("subjects")
      .select("id,name");
    if (subErr) throw new Error(subErr.message);

    const subjMap = new Map<string, string>();
    for (const s of subjects ?? []) subjMap.set(s.id, s.name);

    const rows = new Map<string, GlobalRankRow>();
    for (const p of profiles ?? []) {
      rows.set(p.id, {
        id: p.id,
        display_name: p.display_name,
        full_name: p.full_name ?? null,
        avatar_emoji: p.avatar_emoji ?? "🐻",
        avatar_url: (p as { avatar_url?: string | null }).avatar_url ?? null,
        character_type: (p as { character_type?: string | null }).character_type ?? null,
        character_exp: (p as { character_exp?: number }).character_exp ?? 0,
        campus: p.campus ?? null,
        class_name: p.class_name ?? null,
        school: (p as { school?: string | null }).school ?? null,
        grade: (p as { grade?: string | null }).grade ?? null,
        total: 0,
        cats: { math: 0, english: 0, korean: 0, explore: 0 },
      });
    }
    for (const s of sessions ?? []) {
      const row = rows.get(s.user_id);
      if (!row) continue;
      row.total += s.duration_seconds;
      const name = subjMap.get(s.subject_id);
      const cat = name ? classify(name) : "explore";
      row.cats[cat] += s.duration_seconds;
    }
    return Array.from(rows.values()).filter((r) => r.total > 0 || r.character_exp > 0);
  });
