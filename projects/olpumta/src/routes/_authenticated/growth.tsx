import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { kstDateEndISO, kstDateStartISO, useCurrentExamPeriod } from "@/lib/exam-period";
import {
  CHARACTERS,
  CharacterType,
  STAGE_LABEL,
  STAGE_THRESHOLDS,
  expToStage,
  characterImage,
  nextStageProgress,
} from "@/lib/character";
import { formatTotal, formatTotalShort } from "@/lib/format";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/growth")({
  component: GrowthPage,
  head: () => ({
    meta: [
      { title: "건축 기록 — 옳품타" },
      { name: "description", content: "공부 시간으로 세워 올리는 나만의 오런 등대 건축 기록을 확인하세요." },
    ],
  }),
});

type Session = { ended_at: string; duration_seconds: number };

function GrowthPage() {
  const { user } = useAuth();
  const { data: period } = useCurrentExamPeriod();

  const { data, refetch } = useQuery({
    queryKey: ["growth", user?.id, period?.id ?? "none"],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: prof }, sessRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("character_type,display_name,full_name,created_at")
          .eq("id", user!.id)
          .single(),
        (() => {
          let q = supabase
            .from("study_sessions")
            .select("ended_at,duration_seconds")
            .eq("user_id", user!.id)
            .order("ended_at", { ascending: true });
          if (period) q = q.gte("started_at", kstDateStartISO(period.start_date)).lt("started_at", kstDateEndISO(period.end_date));
          return q;
        })(),
      ]);
      const sessions = ((sessRes.data ?? []) as Session[]);
      const totalSec = sessions.reduce((a, r) => a + r.duration_seconds, 0);
      const exp = Math.floor(totalSec / 60);

      // 진화 타임라인 derive
      let cum = 0;
      let lastStage = 0;
      const events: { stage: number; at: string; exp: number }[] = [
        { stage: 0, at: (prof?.created_at as string) ?? new Date().toISOString(), exp: 0 },
      ];
      for (const s of sessions) {
        cum += s.duration_seconds;
        const expAt = Math.floor(cum / 60);
        const stage = expToStage(expAt);
        if (stage > lastStage) {
          events.push({ stage, at: s.ended_at, exp: expAt });
          lastStage = stage;
        }
      }
      return {
        type: prof?.character_type as CharacterType | null,
        name: (prof?.full_name as string) ?? (prof?.display_name as string) ?? "공부친구",
        exp,
        totalSec,
        events: events.reverse(), // 최신순
      };
    },
  });

  // study_sessions 실시간 변경 구독 → 즉시 새로고침
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`growth-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "study_sessions", filter: `user_id=eq.${user.id}` },
        () => refetch(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user, refetch]);

  if (!user || !data) {
    return <div className="min-h-screen bg-paper" />;
  }

  if (!data.type) {
    return (
      <div className="min-h-screen bg-paper text-ink grid place-items-center px-6">
        <div className="text-center space-y-3">
          <p className="text-sm text-ink/60">건축을 준비 중입니다…</p>
          <Link to="/character" className="inline-flex h-11 px-6 rounded-full bg-accent text-sheet text-sm font-semibold items-center">
            등대 짓기 시작
          </Link>
        </div>
      </div>
    );
  }

  const c = CHARACTERS[data.type];
  const prog = nextStageProgress(data.exp);
  const currentThreshold = STAGE_THRESHOLDS[prog.stage];
  const nextThreshold = STAGE_THRESHOLDS[prog.stage + 1];
  const isFinal = nextThreshold === undefined;

  return (
    <div className="min-h-screen bg-paper text-ink pb-32">
      <header className="max-w-md mx-auto pt-10 px-6 flex items-center gap-2">
        <Link to="/" className="size-9 rounded-full bg-sheet ring-1 ring-black/5 grid place-items-center">
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="text-xl font-semibold font-display">건축 기록</h1>
      </header>

      <main className="max-w-md mx-auto px-6 mt-6 space-y-6">
        {/* 현재 상태 카드 */}
        <section className="p-6 bg-sheet rounded-[32px] ring-1 ring-black/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-accent/60" />
          <div className="flex flex-col items-center text-center">
            <div className={`relative size-36 rounded-[28px] ${c.bg} grid place-items-center overflow-hidden`}>
              <span className="mon-shadow absolute bottom-2 left-1/2 h-2 w-20 rounded-full bg-black/50 blur-md" />
              <img src={characterImage(data.type, data.exp)} alt={c.name} className="mon-anim size-28 object-contain relative" />
            </div>
            <h2 className="mt-4 text-lg font-semibold font-display">{c.name}</h2>
            <span className="mt-1 text-[11px] px-2.5 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
              {prog.label} · Lv.{prog.stage + 1}
            </span>
            <p className="text-xs text-ink/50 mt-2">열공 인증으로 여러분의 등대를 완성해보세요!</p>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-ink/60">EXP</span>
              <span className="text-sm font-semibold font-display tabular-nums">
                {data.exp.toLocaleString()} {isFinal ? "" : `/ ${nextThreshold.toLocaleString()}`}
              </span>
            </div>
            <div className="h-3 w-full bg-paper rounded-full overflow-hidden ring-1 ring-black/5">
              <div className="h-full bg-accent transition-all duration-700" style={{ width: `${prog.percent}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-ink/40">
              <span>{currentThreshold.toLocaleString()} EXP</span>
              {!isFinal && <span>{prog.percent}%</span>}
              {!isFinal && <span>{nextThreshold.toLocaleString()} EXP</span>}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-paper text-center">
              <p className="text-[10px] text-ink/50">누적 공부</p>
              <p className="text-sm font-semibold font-display mt-0.5 tabular-nums">{formatTotal(data.totalSec)}</p>
            </div>
            <div className="p-3 rounded-2xl bg-paper text-center">
              <p className="text-[10px] text-ink/50">{isFinal ? "완공" : "다음 공사까지"}</p>
              <p className="text-sm font-semibold font-display mt-0.5 tabular-nums">
                {isFinal ? "완료 🎉" : formatTotalShort(prog.remaining * 60)}
              </p>
            </div>
          </div>
        </section>

        {/* 건축 단계 미리보기 */}
        <section className="p-5 bg-sheet rounded-[28px] ring-1 ring-black/5">
          <h3 className="text-sm font-semibold font-display mb-3">건축 단계</h3>
          <div className="grid grid-cols-5 gap-2">
            {c.stages.map((src, i) => {
              const reached = data.exp >= STAGE_THRESHOLDS[i];
              const isFinal = i === c.stages.length - 1;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`aspect-square w-full rounded-2xl ${c.bg} grid place-items-center p-1 transition-opacity ${reached ? "" : "opacity-30 grayscale"} ${isFinal && reached ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-200/50" : ""}`}>
                    <img src={src} alt={STAGE_LABEL[i]} className={`w-full h-full object-contain ${reached ? (isFinal ? "mon-anim-breath" : "mon-anim-breath") : ""}`} style={{ animationDelay: `${i * 0.25}s` }} />
                  </div>
                  <span className={`text-[10px] font-medium ${isFinal && reached ? "text-yellow-600 font-bold" : i === prog.stage ? "text-accent" : "text-ink/50"}`}>
                    {STAGE_LABEL[i]}
                  </span>
                  <span className="text-[9px] text-ink/40 tabular-nums">{STAGE_THRESHOLDS[i]}+</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 건축 타임라인 */}
        <section className="p-5 bg-sheet rounded-[28px] ring-1 ring-black/5">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-sm font-semibold font-display">건축 타임라인</h3>
            <span className="text-[10px] text-ink/40">{data.events.length}개의 기록</span>
          </div>
          <ol className="relative border-l-2 border-dashed border-ink/10 ml-3 space-y-5">
            {data.events.map((e, i) => {
              const date = new Date(e.at);
              const isLatest = i === 0;
              return (
                <li key={`${e.stage}-${e.at}`} className="pl-5 relative">
                  <span className={`absolute -left-[11px] top-0.5 size-5 rounded-full ring-2 ring-sheet grid place-items-center ${isLatest ? "bg-accent" : "bg-ink/20"}`}>
                    <span className="size-1.5 rounded-full bg-sheet" />
                  </span>
                  <div className="flex items-center gap-3">
                    <div className={`size-12 rounded-2xl ${c.bg} grid place-items-center shrink-0 overflow-hidden`}>
                      <img src={c.stages[e.stage]} alt={STAGE_LABEL[e.stage]} className="mon-anim-sm size-10 object-contain" style={{ animationDelay: `${i * 0.18}s` }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">
                        {e.stage === 0 ? "기초공사 시작" : e.stage === 4 ? "등대 완공! 🎉" : `${STAGE_LABEL[e.stage]} 단계 진입!`}
                      </p>
                      <p className="text-[11px] text-ink/50 mt-0.5">
                        {date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                        {" · "}
                        {date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {e.exp > 0 && (
                        <p className="text-[10px] text-ink/40 mt-0.5 tabular-nums">누적 {e.exp.toLocaleString()} EXP</p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          {data.events.length === 1 && (
            <p className="text-xs text-ink/40 text-center mt-4">공부를 시작하면 건축 기록이 쌓여요</p>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
