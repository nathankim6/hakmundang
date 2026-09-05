import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCurrentExamPeriod } from "@/lib/exam-period";
import { BottomNav } from "@/components/BottomNav";
import { formatTotal } from "@/lib/format";
import { useIsAdmin } from "@/lib/admin";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_authenticated/stats")({
  component: Stats,
  head: () => ({
    meta: [
      { title: "공부 통계 — 옳품타" },
      { name: "description", content: "옳품타에서 일·주간 공부 시간과 과목별 비중을 한눈에 확인해요." },
      { property: "og:title", content: "공부 통계 — 옳품타" },
      { property: "og:description", content: "옳품타에서 일·주간 공부 시간과 과목별 비중을 한눈에 확인해요." },
    ],
  }),
});

// 베이지 다이어리 톤에 어울리는 따뜻한 파스텔 팔레트
const COLORS = [
  "oklch(0.78 0.11 55)",   // 살구
  "oklch(0.74 0.10 200)",  // 청록
  "oklch(0.80 0.11 145)",  // 세이지
  "oklch(0.84 0.13 85)",   // 머스타드
  "oklch(0.78 0.10 25)",   // 코랄
  "oklch(0.76 0.10 290)",  // 라벤더
];

function Stats() {
  const admin = useIsAdmin();
  if (!admin) return <AdminGate />;
  return <StatsInner />;
}

function AdminGate() {
  return (
    <div className="min-h-dvh bg-paper grid place-items-center px-4">
      <div className="w-full max-w-sm bg-sheet rounded-[28px] ring-1 ring-black/5 p-6 text-center">
        <div className="text-3xl mb-2">🔒</div>
        <h1 className="text-lg font-display font-semibold mb-1">관리자 전용</h1>
        <p className="text-xs text-ink/50 mb-4">통계 페이지는 관리자 계정으로만 접근할 수 있어요.</p>
        <Link to="/" className="inline-block bg-accent text-white rounded-2xl px-5 py-3 font-semibold text-sm">
          홈으로
        </Link>
      </div>
    </div>
  );
}

function fmtSec(sec: number) {
  if (sec <= 0) return "0분";
  if (sec < 60) return `${sec}초`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return s ? `${m}분 ${s}초` : `${m}분`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm ? `${h}시간 ${mm}분` : `${h}시간`;
}

function fmtAxis(sec: number) {
  if (sec <= 0) return "0";
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm ? `${h}h${mm}` : `${h}h`;
}

function StatsInner() {
  const { user } = useAuth();
  const { data: period } = useCurrentExamPeriod();
  const [range, setRange] = useState<"week" | "month">("week");

  const { data, isLoading } = useQuery({
    queryKey: ["stats", user?.id, range, period?.id ?? "none"],
    enabled: !!user,
    queryFn: async () => {
      const days = range === "week" ? 7 : 30;
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - (days - 1));

      let q = supabase
        .from("study_sessions")
        .select("started_at,duration_seconds,subject_id")
        .eq("user_id", user!.id)
        .gte("started_at", start.toISOString());
      if (period) q = q.eq("period_id", period.id);
      const { data: sessions, error } = period
        ? await q
        : { data: [] as { started_at: string; duration_seconds: number; subject_id: string }[], error: null };
      if (error) throw error;

      const { data: subjects } = await supabase.from("subjects").select("id,name,color").eq("user_id", user!.id);
      const subMap = new Map((subjects ?? []).map((s) => [s.id, s]));

      const byDay = Array.from({ length: days }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return { date: d, label: `${d.getMonth() + 1}/${d.getDate()}`, seconds: 0 };
      });
      const bySubject = new Map<string, number>();
      let total = 0;

      for (const s of sessions ?? []) {
        const d = new Date(s.started_at);
        const idx = Math.floor((d.setHours(0, 0, 0, 0) - start.getTime()) / 86400000);
        if (idx >= 0 && idx < days) byDay[idx].seconds += s.duration_seconds;
        bySubject.set(s.subject_id, (bySubject.get(s.subject_id) ?? 0) + s.duration_seconds);
        total += s.duration_seconds;
      }

      const pie = Array.from(bySubject.entries())
        .map(([id, sec]) => ({ name: subMap.get(id)?.name ?? "기타", value: sec }))
        .sort((a, b) => b.value - a.value);

      return { byDay, pie, total, days };
    },
  });

  const summary = useMemo(() => {
    if (!data) return { avg: 0, best: 0, studied: 0 };
    const studied = data.byDay.filter((d) => d.seconds > 0).length;
    const best = data.byDay.reduce((m, d) => Math.max(m, d.seconds), 0);
    const avg = studied ? Math.floor(data.total / studied) : 0;
    return { avg, best, studied };
  }, [data]);

  return (
    <div className="min-h-screen bg-paper text-ink pb-32">
      {/* 헤더 */}
      <header className="max-w-md mx-auto pt-12 px-6">
        <p className="text-[11px] tracking-[0.18em] uppercase text-ink/40 font-medium">Study Insights</p>
        <h1 className="text-[28px] leading-tight font-semibold font-display mt-1">공부 통계</h1>
        <p className="text-sm text-ink/55 mt-1">
          지난 {range === "week" ? "7일" : "30일"}의 학습 흐름이에요
        </p>
      </header>

      <main className="max-w-md mx-auto px-6 mt-6 space-y-5">
        {/* 기간 토글 */}
        <div className="inline-flex p-1 bg-sheet rounded-full ring-1 ring-black/5 shadow-sm">
          {(["week", "month"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={
                "px-5 py-2 rounded-full text-sm font-semibold transition-all " +
                (range === r
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-ink/55 hover:text-ink/80")
              }
            >
              {r === "week" ? "주간" : "월간"}
            </button>
          ))}
        </div>

        {/* 총 시간 하이라이트 카드 */}
        <section className="relative overflow-hidden rounded-[28px] p-6 ring-1 ring-black/5 shadow-[0_8px_24px_-12px_rgba(120,80,40,0.18)]"
          style={{
            background: "linear-gradient(135deg, oklch(0.96 0.03 75) 0%, oklch(0.93 0.05 60) 100%)",
          }}>
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-40"
            style={{ background: "radial-gradient(circle, oklch(0.85 0.10 55) 0%, transparent 70%)" }} />
          <div className="relative">
            <p className="text-[11px] tracking-[0.16em] uppercase text-ink/45 font-semibold">Total</p>
            <p className="mt-2 text-4xl font-display font-bold tracking-tight leading-none">
              {formatTotal(data?.total ?? 0)}
            </p>
            <p className="mt-1 text-xs text-ink/55">전체 누적 학습 시간</p>
          </div>
        </section>

        {/* KPI 3개 */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { label: "일평균", value: fmtSec(summary.avg), hint: "공부한 날 기준" },
            { label: "최고 기록", value: fmtSec(summary.best), hint: "하루 최대" },
            { label: "공부한 날", value: `${summary.studied}일`, hint: `${data?.days ?? 0}일 중` },
          ].map((k) => (
            <div key={k.label} className="bg-sheet rounded-2xl ring-1 ring-black/5 p-3.5">
              <p className="text-[10px] tracking-wider uppercase text-ink/40 font-semibold">{k.label}</p>
              <p className="mt-1.5 text-base font-display font-bold leading-tight break-keep">{k.value}</p>
              <p className="mt-0.5 text-[10px] text-ink/40 truncate">{k.hint}</p>
            </div>
          ))}
        </section>

        {/* 일별 차트 */}
        <section className="bg-sheet rounded-[24px] ring-1 ring-black/5 p-5 shadow-sm">
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="text-base font-semibold font-display">일별 공부 시간</h3>
            <span className="text-[10px] text-ink/40 tracking-wider uppercase">Daily</span>
          </div>
          <p className="text-xs text-ink/50 mb-4">그래프 위에 마우스를 올리면 자세히 볼 수 있어요</p>
          <div className="h-60 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.byDay ?? []} margin={{ top: 16, right: 12, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.82 0.11 60)" />
                    <stop offset="100%" stopColor="oklch(0.74 0.10 50)" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="oklch(0.36 0.025 60 / 0.08)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "oklch(0.55 0.02 60)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={range === "week" ? 0 : "preserveStartEnd"}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "oklch(0.55 0.02 60)" }}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                  tickFormatter={fmtAxis}
                />
                <Tooltip
                  cursor={{ fill: "oklch(0.36 0.025 60 / 0.05)" }}
                  contentStyle={{
                    background: "var(--sheet)",
                    border: "1px solid oklch(0.36 0.025 60 / 0.1)",
                    borderRadius: 14,
                    fontSize: 12,
                    boxShadow: "0 8px 24px -12px rgba(0,0,0,0.15)",
                  }}
                  labelStyle={{ color: "var(--ink)", fontWeight: 600 }}
                  formatter={(v: number) => [fmtSec(v), "공부"]}
                />
                <Bar dataKey="seconds" fill="url(#barFill)" radius={[8, 8, 2, 2]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 과목별 비중 */}
        <section className="bg-sheet rounded-[24px] ring-1 ring-black/5 p-5 shadow-sm">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-base font-semibold font-display">과목별 비중</h3>
            <span className="text-[10px] text-ink/40 tracking-wider uppercase">Subjects</span>
          </div>

          {data?.pie.length ? (
            <div className="flex flex-col items-center">
              {/* 도넛 + 중앙 텍스트 */}
              <div className="relative w-full h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.pie}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={90}
                      paddingAngle={2}
                      stroke="var(--sheet)"
                      strokeWidth={3}
                    >
                      {data.pie.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--sheet)",
                        border: "1px solid oklch(0.36 0.025 60 / 0.1)",
                        borderRadius: 14,
                        fontSize: 12,
                        boxShadow: "0 8px 24px -12px rgba(0,0,0,0.15)",
                      }}
                      formatter={(v: number, n: string) => [fmtSec(v), n]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-ink/40 font-semibold">합계</p>
                    <p className="text-lg font-display font-bold leading-tight mt-0.5">
                      {formatTotal(data.total)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 범례 — 잘림 없이 가로 폭 활용 */}
              <ul className="w-full mt-4 space-y-2">
                {data.pie.map((p, i) => {
                  const pct = data.total > 0 ? Math.round((p.value / data.total) * 100) : 0;
                  return (
                    <li key={p.name} className="flex items-center gap-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-sm text-ink/85 truncate flex-1 min-w-0">{p.name}</span>
                      <span className="text-xs text-ink/50 tabular-nums shrink-0">{pct}%</span>
                      <span className="text-sm font-medium tabular-nums shrink-0 min-w-[72px] text-right">
                        {fmtSec(p.value)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="text-3xl mb-2">📚</div>
              <p className="text-sm text-ink/45">아직 기록이 없어요</p>
            </div>
          )}
        </section>

        {isLoading && (
          <p className="text-center text-xs text-ink/40 py-2">불러오는 중…</p>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
