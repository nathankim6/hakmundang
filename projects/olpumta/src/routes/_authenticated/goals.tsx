import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/goals")({ component: Goals });

function Goals() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState(60);
  const [period, setPeriod] = useState<"daily" | "weekly">("daily");

  const { data: goals } = useQuery({
    queryKey: ["goals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("goals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["goal-progress", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay());
      const { data: rows } = await supabase
        .from("study_sessions")
        .select("started_at,duration_seconds")
        .gte("started_at", weekStart.toISOString());
      let dailySec = 0, weeklySec = 0;
      for (const r of rows ?? []) {
        const d = new Date(r.started_at);
        if (d >= today) dailySec += r.duration_seconds;
        weeklySec += r.duration_seconds;
      }
      return { daily: Math.floor(dailySec / 60), weekly: Math.floor(weeklySec / 60) };
    },
  });

  const add = async () => {
    if (!user || !title.trim() || minutes <= 0) return;
    const { error } = await supabase.from("goals").insert({
      user_id: user.id, title: title.trim(), target_minutes: minutes, period,
    });
    if (error) toast.error(error.message);
    else { toast.success("목표 추가 완료!"); setTitle(""); setMinutes(60); qc.invalidateQueries({ queryKey: ["goals"] }); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["goals"] });
  };

  return (
    <div className="min-h-screen bg-paper text-ink pb-32">
      <header className="max-w-md mx-auto pt-10 px-6">
        <h1 className="text-2xl font-semibold font-display">공부 목표</h1>
        <p className="text-sm text-ink/60">매일 조금씩, 꾸준하게 🌱</p>
      </header>

      <main className="max-w-md mx-auto px-6 mt-6 space-y-6">
        <section className="bg-sheet rounded-[24px] ring-1 ring-black/5 p-5 space-y-3">
          <h3 className="text-sm font-semibold font-display">새 목표 추가</h3>
          <input
            type="text" placeholder="목표 이름 (예: 매일 영어 독해)"
            value={title} onChange={e => setTitle(e.target.value)}
            className="w-full h-11 px-4 rounded-2xl bg-paper ring-1 ring-black/10 text-sm focus:outline-none focus:ring-accent"
          />
          <div className="flex gap-2">
            <input
              type="number" min={1} max={1440} value={minutes}
              onChange={e => setMinutes(Number(e.target.value))}
              className="w-24 h-11 px-4 rounded-2xl bg-paper ring-1 ring-black/10 text-sm focus:outline-none focus:ring-accent"
            />
            <span className="self-center text-sm text-ink/50">분</span>
            <div className="flex-1 flex gap-2">
              {(["daily", "weekly"] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={"flex-1 h-11 rounded-2xl text-sm font-medium ring-1 " +
                    (period === p ? "bg-accent text-sheet ring-accent" : "bg-paper text-ink/70 ring-black/10")}>
                  {p === "daily" ? "매일" : "매주"}
                </button>
              ))}
            </div>
          </div>
          <button onClick={add} className="w-full h-11 rounded-full bg-accent text-sheet text-sm font-semibold">
            추가하기
          </button>
        </section>

        <section className="space-y-3">
          {(goals ?? []).map(g => {
            const current = g.period === "daily" ? (progress?.daily ?? 0) : (progress?.weekly ?? 0);
            const pct = Math.min(100, Math.round((current / g.target_minutes) * 100));
            return (
              <div key={g.id} className="bg-sheet rounded-[24px] ring-1 ring-black/5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold">{g.title}</p>
                    <p className="text-xs text-ink/50 mt-0.5">{g.period === "daily" ? "매일" : "매주"} {g.target_minutes}분</p>
                  </div>
                  <button onClick={() => remove(g.id)} className="text-ink/30 hover:text-destructive p-1">
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-3 h-2 w-full bg-paper rounded-full overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-ink/60 mt-2 text-right tabular-nums">{current} / {g.target_minutes}분 · {pct}%</p>
              </div>
            );
          })}
          {goals?.length === 0 && (
            <p className="text-sm text-ink/40 text-center py-8">아직 목표가 없어요. 첫 목표를 추가해보세요!</p>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
