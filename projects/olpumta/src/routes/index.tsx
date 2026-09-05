import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import bearMascot from "@/assets/bear-mascot.png";
import orunLogo from "@/assets/orun-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
import { formatTimer, formatTotal, STICKER_BG, STICKER_BAR } from "@/lib/format";
import { CHARACTERS, CharacterType, nextStageProgress, characterImage, expToStage } from "@/lib/character";
import { kstDateEndISO, kstDateStartISO, useCurrentExamPeriod } from "@/lib/exam-period";
import { toast } from "sonner";
import {
  Plus, X,
  Sigma, Languages, BookOpen, Landmark, Globe2, FlaskConical, Atom,
  Leaf, Music, Palette, Dumbbell, Code2, BookMarked, Calculator,
  ScrollText, Mountain, Brain, PenTool, type LucideIcon,
} from "lucide-react";

// 과목 이름 → 어울리는 아이콘 매핑
function subjectIcon(name: string): LucideIcon {
  const n = name.replace(/\s/g, "");
  if (/(수학|미적|기하|확통|대수|산수)/.test(n)) return Sigma;
  if (/(영어|영문|English|english)/.test(n)) return Languages;
  if (/(국어|문학|독서|작문|논술)/.test(n)) return BookOpen;
  if (/(한국사|국사|세계사|역사)/.test(n)) return Landmark;
  if (/(사회|정치|경제|법|윤리|지리)/.test(n)) return Globe2;
  if (/(화학)/.test(n)) return FlaskConical;
  if (/(물리)/.test(n)) return Atom;
  if (/(생명|생물)/.test(n)) return Leaf;
  if (/(지구|천체)/.test(n)) return Mountain;
  if (/(과학)/.test(n)) return FlaskConical;
  if (/(음악)/.test(n)) return Music;
  if (/(미술|디자인|그림)/.test(n)) return Palette;
  if (/(체육|운동|PE)/.test(n)) return Dumbbell;
  if (/(코딩|컴퓨터|프로그|정보|코드|IT)/.test(n)) return Code2;
  if (/(연산|계산)/.test(n)) return Calculator;
  if (/(한문|한자)/.test(n)) return ScrollText;
  if (/(심리|뇌)/.test(n)) return Brain;
  if (/(글쓰기|작문|에세이)/.test(n)) return PenTool;
  return BookMarked;
}
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SUBJECT_COLORS = ["pink", "blue", "green", "yellow", "purple"] as const;

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "옳품타 — 옳은영어 열정품은 타이머" },
      { name: "description", content: "옳품타에서 과목별 공부 시간을 기록하고 친구들과 함께 꾸준히 공부해요." },
      { property: "og:title", content: "옳품타 — 옳은영어 열정품은 타이머" },
      { property: "og:description", content: "옳품타에서 과목별 공부 시간을 기록하고 친구들과 함께 꾸준히 공부해요." },
    ],
  }),
});

type Subject = { id: string; name: string; color: string };

function Home() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const [dateLabel, setDateLabel] = useState("");
  const [dateDay, setDateDay] = useState("");
  const [dateWeekday, setDateWeekday] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [pauseCount, setPauseCount] = useState(0);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const startedAtRef = useRef<Date | null>(null);
  const segmentStartedAtRef = useRef<Date | null>(null);
  const [sessionSubject, setSessionSubject] = useState<Subject | null>(null);
  const sessionSubjectRef = useRef<Subject | null>(null);
  const restoringSessionRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  const pauseKey = () => `oth-pauses-${new Date().toDateString()}`;

  useEffect(() => {
    const now = new Date();
    setDateLabel(now.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" }));
    setDateDay(now.toLocaleDateString("ko-KR", { month: "long", day: "numeric" }));
    setDateWeekday(now.toLocaleDateString("ko-KR", { weekday: "long", year: "numeric" }));
    try {
      const v = localStorage.getItem(pauseKey());
      setPauseCount(v ? parseInt(v, 10) || 0 : 0);
    } catch { /* ignore */ }
  }, []);

  const { data: subjects } = useQuery({
    queryKey: ["subjects", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Subject[]> => {
      const { data, error } = await supabase.from("subjects").select("id,name,color").eq("user_id", user!.id).order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: period } = useCurrentExamPeriod();

  const { data: character } = useQuery({
    queryKey: ["character", user?.id, period?.id ?? "none"],
    enabled: !!user,
    queryFn: async () => {
      const { data: prof } = await supabase.from("profiles").select("character_type,full_name,display_name,campus,class_name,avatar_url,avatar_emoji").eq("id", user!.id).single();
      let totalSec = 0;
      if (period) {
        const { data: sess } = await supabase
          .from("study_sessions")
          .select("duration_seconds")
          .eq("user_id", user!.id)
          .gte("started_at", kstDateStartISO(period.start_date))
          .lt("started_at", kstDateEndISO(period.end_date));
        totalSec = (sess ?? []).reduce((a, r) => a + r.duration_seconds, 0);
      }
      const exp = Math.floor(totalSec / 60);
      return {
        type: prof?.character_type as CharacterType | null,
        exp,
        full_name: prof?.full_name as string | null,
        display_name: prof?.display_name as string | null,
        campus: prof?.campus as string | null,
        class_name: prof?.class_name as string | null,
        avatar_url: prof?.avatar_url as string | null,
        avatar_emoji: prof?.avatar_emoji as string | null,
      };
    },
  });

  const { data: friendIds } = useQuery({
    queryKey: ["friend-ids", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("friendships").select("friend_id").eq("user_id", user!.id);
      return new Set((data ?? []).map(r => r.friend_id));
    },
  });

  // 실시간 접속 친구 (Supabase Realtime presence)
  type OnlineUser = {
    user_id: string;
    display_name: string;
    full_name: string | null;
    avatar_emoji: string;
    avatar_url: string | null;
    character_type: CharacterType | null;
    campus: string | null;
    class_name: string | null;
    grade: string | null;
    school: string | null;
    exp: number;
    subject_name: string | null;
    running: boolean;
    started_at: string | null;
    subject_today_baseline: number | null;
    subject_total_baseline: number | null;
    is_admin?: boolean;
  };
  const [online, setOnline] = useState<OnlineUser[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const myPresenceRef = useRef<OnlineUser | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("display_name,full_name,avatar_emoji,avatar_url,character_type,campus,class_name,grade,school").eq("id", user.id).single();
      if (cancelled || !prof) return;
      const channel = supabase.channel("online-users", { config: { presence: { key: user.id } } });
      channelRef.current = channel;
      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState<OnlineUser>();
          const list: OnlineUser[] = [];
          for (const key in state) {
            const entry = state[key]?.[0];
            if (entry) list.push(entry);
          }
          setOnline(list);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            const initial: OnlineUser = {
              user_id: user.id,
              display_name: prof.display_name,
              full_name: (prof.full_name as string | null) ?? null,
              avatar_emoji: prof.avatar_emoji,
              avatar_url: (prof as { avatar_url?: string | null }).avatar_url ?? null,
              character_type: prof.character_type as CharacterType | null,
              campus: (prof.campus as string | null) ?? null,
              class_name: (prof.class_name as string | null) ?? null,
              grade: (prof.grade as string | null) ?? null,
              school: (prof as { school?: string | null }).school ?? null,
              exp: 0,
              subject_name: null,
              running: false,
              started_at: null,
              subject_today_baseline: null,
              subject_total_baseline: null,
              is_admin: (user.email ?? "").toLowerCase() === "5554ksj2@gmail.com",
            };
            myPresenceRef.current = initial;
            await channel.track(initial);
          }
        });
    })();
    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user]);

  const { data: todayTotals } = useQuery({
    queryKey: ["today-totals", user?.id, period?.id ?? "none"],
    enabled: !!user,
    queryFn: async () => {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      let q = supabase
        .from("study_sessions")
        .select("subject_id,duration_seconds")
        .eq("user_id", user!.id)
        .gte("started_at", start.toISOString());
      const { data, error } = await q;
      if (error) throw error;
      const map = new Map<string, number>();
      let total = 0;
      for (const r of data ?? []) {
        map.set(r.subject_id, (map.get(r.subject_id) ?? 0) + r.duration_seconds);
        total += r.duration_seconds;
      }
      return { perSubject: map, total };
    },
  });

  const { data: allTimeTotal } = useQuery({
    queryKey: ["all-time-total", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_sessions")
        .select("duration_seconds")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).reduce((a, r) => a + r.duration_seconds, 0);
    },
  });

  const { data: allTimeBySubject } = useQuery({
    queryKey: ["all-time-by-subject", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_sessions")
        .select("subject_id,duration_seconds")
        .eq("user_id", user!.id);
      if (error) throw error;
      const m = new Map<string, number>();
      for (const r of data ?? []) m.set(r.subject_id, (m.get(r.subject_id) ?? 0) + r.duration_seconds);
      return m;
    },
  });

  useEffect(() => {
    if (!subjects?.length || activeId) return;
    try {
      const raw = localStorage.getItem("oth-running-session");
      const saved = raw ? JSON.parse(raw) : null;
      const savedSubject = subjects.find((s) =>
        (typeof saved?.subject_id === "string" && s.id === saved.subject_id) ||
        (typeof saved?.subject_name === "string" && s.name === saved.subject_name),
      );
      if (savedSubject) {
        setActiveId(savedSubject.id);
        return;
      }
    } catch { /* ignore */ }
    setActiveId(subjects[0].id);
  }, [subjects, activeId]);

  // 사용자가 직접 정지/기록 전까지 계속 흐름 (화면이 꺼져 있어도 경과 시간으로 보정)
  const lastTickRef = useRef<number | null>(null);
  useEffect(() => {
    if (!running) {
      lastTickRef.current = null;
      return;
    }
    lastTickRef.current = Date.now();
    const tick = () => {
      const now = Date.now();
      const last = lastTickRef.current ?? now;
      const delta = Math.max(1, Math.round((now - last) / 1000));
      lastTickRef.current = now;
      setSessionSeconds(v => v + delta);
    };
    intervalRef.current = window.setInterval(tick, 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [running]);

  // 타이머가 도는 동안 화면이 꺼지지 않도록 Wake Lock 유지
  useEffect(() => {
    if (!running) return;
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let wakeLock: WakeLockSentinel | null = null;
    let cancelled = false;
    const request = async () => {
      try {
        // @ts-ignore — wakeLock 타입은 일부 환경에서만 제공됨
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) { lock.release().catch(() => {}); return; }
        wakeLock = lock;
        lock.addEventListener?.("release", () => { wakeLock = null; });
      } catch {
        // 사용자가 권한을 거부했거나 브라우저가 지원하지 않음 — 무시
      }
    };
    request();
    const onVisible = () => {
      if (document.visibilityState === "visible" && !wakeLock) request();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      if (wakeLock) wakeLock.release().catch(() => {});
    };
  }, [running]);

  useEffect(() => {
    if (!subjects?.length || running || startedAtRef.current) return;
    try {
      const raw = localStorage.getItem("oth-running-session");
      const saved = raw ? JSON.parse(raw) : null;
      if (!saved || typeof saved.started_at !== "string") return;
      const savedSubject = subjects.find((s) =>
        (typeof saved.subject_id === "string" && s.id === saved.subject_id) ||
        (typeof saved.subject_name === "string" && s.name === saved.subject_name),
      );
      const started = new Date(saved.started_at);
      if (!savedSubject || Number.isNaN(started.getTime())) return;
      setActiveId(savedSubject.id);
      setSessionSubject(savedSubject);
      sessionSubjectRef.current = savedSubject;
      startedAtRef.current = started;
      // 복원 시점부터를 새 세그먼트로 취급 — 이전에 자동저장된 시간은 다시 더하지 않음
      const resumeAt = new Date();
      segmentStartedAtRef.current = resumeAt;
      restoringSessionRef.current = true;
      setSessionSeconds(0);
      setRunning(true);
    } catch { /* ignore */ }
  }, [subjects, running]);

  const active = subjects?.find(s => s.id === activeId);
  const timerSubject = sessionSubject ?? active;
  const timerSubjectId = timerSubject?.id ?? activeId;
  const totalToday = todayTotals?.total ?? 0;
  const totalAll = (allTimeTotal ?? 0) + sessionSeconds;
  const englishSubject = subjects?.find(s => s.name.includes("영어"));
  const englishToday = englishSubject ? (todayTotals?.perSubject.get(englishSubject.id) ?? 0) : 0;
  // 오늘 같은 과목에 이미 기록된 시간 — 타이머가 여기서부터 이어서 카운트
  const subjectTodaySaved = (timerSubjectId && todayTotals?.perSubject.get(timerSubjectId)) || 0;
  const displaySeconds = subjectTodaySaved + sessionSeconds;
  const focusScore = Math.max(0, 100 - Math.max(0, pauseCount - 1) * 10);
  const onlineFriends = online.filter(u => friendIds?.has(u.user_id));

  // 현재 진행 중인 세션도 EXP에 즉시 반영 (1분=1EXP)
  const liveExp = (character?.exp ?? 0) + Math.floor(sessionSeconds / 60);

  // 진화 단계가 바뀌는 순간 자동 새로고침 (실시간 동기화)
  const prevStageRef = useRef<number | null>(null);
  useEffect(() => {
    if (!character?.type) return;
    const stage = expToStage(liveExp);
    if (prevStageRef.current !== null && stage > prevStageRef.current) {
      qc.invalidateQueries({ queryKey: ["character"] });
      qc.invalidateQueries({ queryKey: ["growth"] });
      toast.success(`${CHARACTERS[character.type].name} 건설이 한 단계 진행됐어요! 🏗️✨`);
    }
    prevStageRef.current = stage;
  }, [liveExp, character?.type, qc]);

  // study_sessions 실시간 변경 구독 → 캐릭터 EXP 자동 동기화
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`home-sessions-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "study_sessions", filter: `user_id=eq.${user.id}` },
        () => {
          qc.invalidateQueries({ queryKey: ["character", user.id] });
          qc.invalidateQueries({ queryKey: ["today-totals", user.id] });
          qc.invalidateQueries({ queryKey: ["all-time-total", user.id] });
          qc.invalidateQueries({ queryKey: ["total-ranking"] });
          qc.invalidateQueries({ queryKey: ["growth", user.id] });
          qc.invalidateQueries({ queryKey: ["stats", user.id] });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);

  // 타이머 상태가 바뀌면 presence 업데이트 + localStorage 동기화 (다른 페이지에서 읽기 위함)
  useEffect(() => {
    const ch = channelRef.current;
    const base = myPresenceRef.current;
    if (restoringSessionRef.current && !running) return;
    if (running) restoringSessionRef.current = false;
    const startedIso = running && startedAtRef.current ? startedAtRef.current.toISOString() : null;
    try {
      if (running && timerSubject?.name && startedIso) {
        localStorage.setItem("oth-running-session", JSON.stringify({
          subject_id: timerSubject.id,
          subject_name: timerSubject.name,
          started_at: startedIso,
        }));
      } else {
        localStorage.removeItem("oth-running-session");
      }
    } catch { /* ignore */ }
    if (!ch || !base) return;
    const subjId = timerSubject?.id ?? null;
    const todayBase = running && subjId ? (todayTotals?.perSubject.get(subjId) ?? 0) : null;
    const totalBase = running && subjId ? (allTimeBySubject?.get(subjId) ?? 0) : null;
    const next: OnlineUser = {
      ...base,
      subject_name: running ? (timerSubject?.name ?? null) : null,
      running,
      started_at: startedIso,
      exp: liveExp,
      subject_today_baseline: todayBase,
      subject_total_baseline: totalBase,
    };
    myPresenceRef.current = next;
    ch.track(next);
  }, [running, timerSubject?.id, timerSubject?.name, liveExp, todayTotals, allTimeBySubject]);

  // 누적된 sessionSeconds를 study_sessions에 부분 저장 → 과목별 누적시간 실시간 반영
  const flushingRef = useRef(false);
  const sessionSecondsRef = useRef(sessionSeconds);
  sessionSecondsRef.current = sessionSeconds;
  const flushPartial = async () => {
    if (flushingRef.current) return;
    const subjectId = sessionSubjectRef.current?.id ?? activeId;
    if (!user || !subjectId || !segmentStartedAtRef.current) return;
    const dur = sessionSecondsRef.current;
    if (dur < 1) return;
    flushingRef.current = true;
    const startedAt = segmentStartedAtRef.current;
    const endedAt = new Date();
    segmentStartedAtRef.current = endedAt;
    setSessionSeconds(0);
    const { error } = await supabase.from("study_sessions").insert({
      user_id: user.id,
      subject_id: subjectId,
      period_id: period?.id ?? null,
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      duration_seconds: dur,
    });
    flushingRef.current = false;
    if (!error) {
      qc.invalidateQueries({ queryKey: ["today-totals"] });
      qc.invalidateQueries({ queryKey: ["all-time-total"] });
      qc.invalidateQueries({ queryKey: ["character"] });
      qc.invalidateQueries({ queryKey: ["total-ranking"] });
      qc.invalidateQueries({ queryKey: ["student-stats"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    }
  };
  const flushRef = useRef(flushPartial);
  flushRef.current = flushPartial;

  // 15초마다 자동 저장 (실시간 과목별 누적)
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => { flushRef.current(); }, 15000);
    return () => window.clearInterval(id);
  }, [running]);

  // 탭/창이 숨겨지면 누적분만 부분 저장 (자동 일시정지 X — 사용자가 직접 멈출 때까지 계속 진행)
  useEffect(() => {
    const onHide = () => {
      if (sessionSecondsRef.current > 0) flushRef.current();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, []);

  const start = () => {
    if (!activeId || !active) return;
    setSessionSubject(active);
    sessionSubjectRef.current = active;
    if (!startedAtRef.current) startedAtRef.current = new Date();
    if (!segmentStartedAtRef.current) segmentStartedAtRef.current = startedAtRef.current;
    setRunning(true);
  };

  const pause = async () => {
    restoringSessionRef.current = false;
    setRunning(false);
    await flushPartial();
    setPauseCount(prev => {
      const next = prev + 1;
      try { localStorage.setItem(pauseKey(), String(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const finish = async () => {
    const subjectId = sessionSubjectRef.current?.id ?? activeId;
    if (!user || !subjectId || !startedAtRef.current) {
      reset(); return;
    }
    const savedSeconds = sessionSecondsRef.current;
    await flushPartial();
    if (savedSeconds > 0) {
      toast.success(`${formatTimer(savedSeconds)} 기록 완료!`);
    }
    reset();
  };

  const reset = () => {
    setRunning(false);
    setSessionSeconds(0);
    setSessionSubject(null);
    sessionSubjectRef.current = null;
    restoringSessionRef.current = false;
    startedAtRef.current = null;
    segmentStartedAtRef.current = null;
  };

  const switchSubject = (id: string) => {
    if (running || sessionSeconds > 0) {
      toast.info("타이머를 먼저 종료해주세요");
      return;
    }
    setActiveId(id);
  };

  return (
    <div className="min-h-screen bg-paper text-ink pb-32 selection:bg-accent/20">
      <header className="relative max-w-md mx-auto mt-4 pt-5 px-5 pb-5 bg-sheet rounded-[28px] ring-1 ring-black/5 shadow-[0_2px_24px_-8px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-44 -z-0 bg-gradient-to-br from-accent/[0.06] via-primary/[0.08] to-sticker-blue/[0.12] blur-2xl" aria-hidden />
        
        {/* 로고 + 프로필 */}
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-11 shrink-0 rounded-2xl bg-white ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.15)] grid place-items-center overflow-hidden">
              <img src={orunLogo} alt="ORUN ACADEMY" className="size-8 object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase leading-none bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Orun Academy
              </p>
              <h1 className="mt-1 text-[18px] font-semibold font-display leading-none tracking-tight text-ink/90 flex items-center whitespace-nowrap">
                <span className="relative inline-flex items-center justify-center mx-[1px] px-[6px] py-[2px] rounded-[8px] text-white text-[14px] font-extrabold bg-gradient-to-br from-primary to-accent shadow-[0_4px_14px_-4px_var(--color-primary),inset_0_1px_0_rgba(255,255,255,0.35)] -rotate-3 hover:rotate-0 transition-transform duration-300">
                  옳
                </span>
                <span className="ml-0.5 text-[11px] text-ink/50 whitespace-pre">은영어  </span>
                <span className="text-[11px] text-ink/50 [writing-mode:vertical-rl] tracking-[0.12em] leading-[1.15]">열정</span>
                <span className="relative inline-flex items-center justify-center mx-[1px] px-[6px] py-[2px] rounded-[8px] text-white text-[14px] font-extrabold bg-gradient-to-br from-accent to-primary shadow-[0_4px_14px_-4px_var(--color-accent),inset_0_1px_0_rgba(255,255,255,0.35)] rotate-3 hover:rotate-0 transition-transform duration-300">
                  품
                </span>
                <span className="ml-0.5 mr-1 text-[11px] text-ink/50">은</span>
                <span className="relative inline-flex items-center justify-center mx-[1px] px-[6px] py-[2px] rounded-[8px] text-white text-[14px] font-extrabold bg-gradient-to-br from-primary via-accent to-primary shadow-[0_4px_14px_-4px_var(--color-primary),inset_0_1px_0_rgba(255,255,255,0.35)] -rotate-3 hover:rotate-0 transition-transform duration-300">
                  타
                </span>
                <span className="ml-0.5 text-[11px] text-ink/50">이머</span>
              </h1>
            </div>
          </div>
          {user ? (
            <Link to="/profile" className={`relative size-9 shrink-0 rounded-full ring-1 ring-black/5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15)] overflow-hidden grid place-items-center ${character?.avatar_url ? "" : (character?.type ? CHARACTERS[character.type].bg : "bg-sticker-pink/60")}`}>
              {character?.avatar_url ? (
                <img src={character.avatar_url} alt="내 프로필" className="size-full object-cover" />
              ) : character?.avatar_emoji ? (
                <span className="text-xl">{character.avatar_emoji}</span>
              ) : (
                <img src={character?.type ? characterImage(character.type, liveExp) : bearMascot} alt="내 캐릭터" className="size-9 object-contain" />
              )}
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-sheet" aria-hidden />
            </Link>
          ) : (
            <Link to="/login" className="shrink-0 px-3.5 h-9 rounded-full bg-ink text-sheet font-semibold flex items-center shadow-sm hover:opacity-90 transition text-xs whitespace-nowrap">
              로그인
            </Link>
          )}
        </div>

        {/* 오늘 날짜 + 시즌 라벨 카드 */}
        <div className="relative mt-4 p-4 bg-paper rounded-2xl ring-1 ring-black/[0.04] text-center">
          <p className="text-[26px] font-bold font-display leading-none tracking-tight text-ink">
            {dateDay}
          </p>
          <p className="mt-1.5 text-xs font-medium text-ink/40 tracking-[0.08em]">
            {dateWeekday}
          </p>
          <div className="mt-2.5 flex justify-center">
            {period ? (
              <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-accent/15 to-primary/10 text-accent ring-1 ring-accent/20 shadow-sm whitespace-nowrap">
                ✦ {period.name}
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-zinc-100 text-ink/45 ring-1 ring-black/5 whitespace-nowrap">시즌 대기</span>
            )}
          </div>
        </div>

        {/* 사용자 정보 뱃지 */}
        {user && (character?.campus || character?.class_name || character?.full_name) && (
          <div className="relative mt-3 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {(character?.avatar_url || character?.avatar_emoji) && (
                <span className="size-5 rounded-full ring-1 ring-black/10 overflow-hidden grid place-items-center bg-paper shrink-0">
                  {character?.avatar_url ? (
                    <img src={character.avatar_url} alt={character.full_name ?? "내 사진"} className="size-full object-cover" />
                  ) : (
                    <span className="text-xs leading-none">{character.avatar_emoji}</span>
                  )}
                </span>
              )}
              {character?.full_name && (
                <span className="text-[11px] font-semibold text-ink/80">{character.full_name}</span>
              )}
              {character?.campus && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white ring-1 ring-black/5 text-ink/70">{character.campus}</span>
              )}
              {character?.class_name && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white ring-1 ring-black/5 text-ink/70">{character.class_name}</span>
              )}
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/10 text-primary ring-1 ring-primary/20 whitespace-nowrap">
              {(() => {
                const now = new Date();
                const year = now.getMonth() < 2 ? now.getFullYear() - 1 : now.getFullYear();
                return `${year}학년도`;
              })()}
            </span>
          </div>
        )}
      </header>

      <main className="max-w-md mx-auto px-6 mt-8">
        {!loading && !user && (
          <div className="mb-6 p-4 bg-sheet rounded-2xl ring-1 ring-black/5 text-center">
            <p className="text-sm text-ink/70">로그인하면 기록·통계·랭킹을 사용할 수 있어요 🐻</p>
          </div>
        )}

        <div className="relative flex flex-col items-center">
          <div className="relative size-64 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-ink/10" style={{ animation: "spin 60s linear infinite" }} />
            <div className="absolute inset-4 rounded-full bg-sheet ring-1 ring-black/5 shadow-sm flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-accent tracking-widest uppercase mb-1">
                {timerSubject?.name ?? "과목 선택"}
              </span>
              <span className="text-5xl font-semibold font-display leading-none tracking-tight tabular-nums">
                {formatTimer(displaySeconds)}
              </span>
              {subjectTodaySaved > 0 && (
              <span className="text-[10px] font-medium text-ink/60 mt-1 tabular-nums">
                오늘 {formatTimer(subjectTodaySaved)}{sessionSeconds > 0 ? ` + ${formatTimer(sessionSeconds)}` : ""}
              </span>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={running ? pause : start}
                  disabled={!activeId}
                  aria-label={running ? "일시정지" : "시작"}
                  className="size-10 rounded-full bg-sticker-green ring-1 ring-black/5 grid place-items-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
                >
                  {running ? (
                    <svg className="size-4 text-ink" viewBox="0 0 16 16" fill="currentColor"><rect x="4" y="3" width="3" height="10" rx="1"/><rect x="9" y="3" width="3" height="10" rx="1"/></svg>
                  ) : (
                    <svg className="size-4 text-ink" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3l7 5-7 5V3z"/></svg>
                  )}
                </button>
                {sessionSeconds > 0 && (
                  <button
                    onClick={finish}
                    className="px-4 h-10 rounded-full bg-accent text-sheet text-xs font-semibold ring-1 ring-black/5 hover:opacity-90"
                  >
                    기록하기
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2 w-full">
            {(subjects ?? []).map(s => {
              const isActive = s.id === activeId;
              const Icon = subjectIcon(s.name);
              return (
                <div key={s.id} className="relative shrink-0 group">
                  <button
                    onClick={() => switchSubject(s.id)}
                    className={"pl-3 pr-7 py-2 rounded-full text-sm font-medium ring-1 transition-colors inline-flex items-center gap-1.5 " +
                      (isActive ? "bg-accent text-sheet ring-accent" : "bg-sheet text-ink/70 ring-black/5")}
                  >
                    <Icon className="size-3.5" strokeWidth={2.25} />
                    {s.name}
                  </button>
                  <button
                    aria-label={`${s.name} 삭제`}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!confirm(`'${s.name}' 과목을 삭제할까요?\n(기록은 유지되지만 새 기록은 불가)`)) return;
                      const { error } = await supabase.from("subjects").delete().eq("id", s.id);
                      if (error) { toast.error("삭제 실패"); return; }
                      if (activeId === s.id) setActiveId(null);
                      toast.success("삭제됨");
                      qc.invalidateQueries({ queryKey: ["subjects"] });
                    }}
                    className={"absolute top-1/2 -translate-y-1/2 right-1.5 size-4 rounded-full grid place-items-center " +
                      (isActive ? "bg-sheet/30 text-sheet hover:bg-sheet/50" : "bg-black/5 text-ink/50 hover:bg-black/10")}
                  >
                    <X className="size-3" strokeWidth={2.5} />
                  </button>
                </div>
              );
            })}
            {user && (
              <>
                <button
                  onClick={() => setAddSubjectOpen(true)}
                  aria-label="과목 추가"
                  className="shrink-0 size-9 rounded-full grid place-items-center bg-sheet text-accent ring-1 ring-dashed ring-accent/40 hover:bg-accent/5"
                >
                  <Plus className="size-4" />
                </button>
                <Dialog open={addSubjectOpen} onOpenChange={setAddSubjectOpen}>
                  <DialogContent className="sm:max-w-sm bg-sheet">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-semibold font-display">과목 추가</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {["국어", "수학", "과학", "사회", "한국사", "영어", "기타"].map(name => {
                        const disabled = (subjects ?? []).some(s => s.name === name);
                        const Icon = subjectIcon(name);
                        return (
                          <button
                            key={name}
                            disabled={disabled}
                            onClick={async () => {
                              if (disabled) return;
                              const color = SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)];
                              const { data, error } = await supabase
                                .from("subjects")
                                .insert({ user_id: user.id, name, color })
                                .select("id")
                                .single();
                              if (error) { console.error("[addSubject]", error); toast.error(error.message || "추가 실패"); return; }
                              toast.success("추가됨");
                              qc.invalidateQueries({ queryKey: ["subjects"] });
                              await qc.refetchQueries({ queryKey: ["subjects"] });
                              setAddSubjectOpen(false);
                              if (data?.id) setActiveId(data.id);
                            }}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm font-medium ring-1 transition-all ${disabled ? "bg-paper text-ink/30 ring-black/5 cursor-not-allowed" : "bg-paper text-ink ring-black/5 hover:bg-accent/5 hover:ring-accent/30"}`}
                          >
                            <Icon className="size-4" strokeWidth={2.25} />
                            {name}
                            {disabled && <span className="ml-auto text-[10px] text-ink/30">있음</span>}
                          </button>
                        );
                      })}
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
            {!user && ["수학", "영어", "한국사", "물리"].map(name => {
              const Icon = subjectIcon(name);
              return (
                <button key={name} className="shrink-0 px-4 py-2 rounded-full text-sm font-medium ring-1 bg-sheet text-ink/40 ring-black/5 inline-flex items-center gap-1.5">
                  <Icon className="size-3.5" strokeWidth={2.25} />
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {user && character?.type && (() => {
          const c = CHARACTERS[character.type];
          const prog = nextStageProgress(liveExp);
          return (
            <Link to="/growth" className="mt-8 block p-5 bg-sheet rounded-[28px] ring-1 ring-black/5 relative overflow-hidden hover:ring-accent/30 transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-accent/60" />
              <div className="flex items-start gap-3">
                <div className={`relative size-14 rounded-2xl ${c.bg} grid place-items-center shrink-0 overflow-hidden`}>
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full bg-black/25 blur-md" />
                  <img src={characterImage(character.type, liveExp)} alt={c.name} width={56} height={56} className="size-11 object-contain relative" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="text-base font-semibold font-display">{c.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">{prog.label}</span>
                  </div>
                  <p className="text-[11px] text-ink/50 mt-0.5 tabular-nums">
                    {prog.remaining > 0 ? `다음 공사까지 ${formatTotal(prog.remaining * 60)} · ${liveExp.toLocaleString()} EXP` : `등대 완공! · ${liveExp.toLocaleString()} EXP`}
                  </p>
                  <div className="h-2 w-full bg-paper rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-accent transition-all duration-700" style={{ width: `${prog.percent}%` }} />
                  </div>
                </div>
                <span className="text-[10px] text-accent font-semibold shrink-0 self-center">자세히 ›</span>
              </div>
            </Link>
          );
        })()}

        <section className="mt-8 grid grid-cols-3 gap-3">
          <div className="p-3 bg-sheet rounded-[24px] ring-1 ring-black/5 flex flex-col gap-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-sticker-blue/60" />
            <span className="text-[10px] font-medium text-ink/50 whitespace-nowrap">오늘 공부</span>
            <span className="text-base font-semibold font-display tabular-nums whitespace-nowrap">{formatTimer(totalToday + sessionSeconds)}</span>
          </div>
          <div className="p-3 bg-sheet rounded-[24px] ring-1 ring-black/5 flex flex-col gap-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-sticker-pink/60" />
            <span className="text-[10px] font-medium text-ink/50 whitespace-nowrap">전체 공부</span>
            <span className="text-base font-semibold font-display tabular-nums whitespace-nowrap">{formatTimer(totalAll)}</span>
          </div>
          <div className="p-3 bg-sheet rounded-[24px] ring-1 ring-black/5 flex flex-col gap-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-sticker-green/60" />
            <span className="text-[10px] font-medium text-ink/50 whitespace-nowrap">영어 공부</span>
            <span className="text-base font-semibold font-display tabular-nums whitespace-nowrap">{formatTimer(englishToday + (englishSubject?.id === timerSubjectId ? sessionSeconds : 0))}</span>
          </div>
        </section>

        {user && subjects && (
          <section className="mt-8">
            <div className="flex justify-between items-end mb-4 px-2">
              <h3 className="text-lg font-semibold font-display">내 과목</h3>
              <Link to="/stats" className="text-xs font-medium text-accent">통계 보기</Link>
            </div>
            <div className="bg-sheet rounded-[28px] ring-1 ring-black/5 divide-y divide-zinc-950/5">
              {subjects.map(s => {
                const total = todayTotals?.perSubject.get(s.id) ?? 0;
                return (
                  <div key={s.id} className="p-4 flex items-center gap-3">
                    {(() => { const Icon = subjectIcon(s.name); return (
                      <div className={`size-9 rounded-2xl ring-1 ring-black/5 ${STICKER_BG[s.color]} grid place-items-center text-ink/70`}>
                        <Icon className="size-[18px]" strokeWidth={2.25} />
                      </div>
                    ); })()}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{s.name}</p>
                      <div className="h-1.5 w-full bg-paper rounded-full overflow-hidden mt-1.5">
                        <div className={`h-full ${STICKER_BAR[s.color]}`} style={{ width: `${Math.min(100, (total / 7200) * 100)}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-medium tabular-nums bg-paper px-2 py-1 rounded-full">{formatTotal(total)}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {user && (() => {
          const connected = online;
          const groups = new Map<string, typeof connected>();
          for (const u of connected) {
            const k = u.is_admin ? "선생님" : (u.campus ?? "기타");
            if (!groups.has(k)) groups.set(k, []);
            groups.get(k)!.push(u);
          }
          const groupList = Array.from(groups.entries()).sort((a, b) => {
            if (a[0] === "선생님") return -1;
            if (b[0] === "선생님") return 1;
            return b[1].length - a[1].length;
          });
          const studyingCount = connected.filter(u => u.running).length;
          return (
            <section className="mt-8">
              <div className="flex items-center gap-2 mb-4 px-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <h3 className="text-lg font-semibold font-display">실시간 접속</h3>
                <span className="text-xs text-ink/40 tabular-nums">{connected.length}명 · 공부중 {studyingCount}</span>
              </div>
              {connected.length === 0 ? (
                <div className="bg-sheet rounded-[28px] ring-1 ring-black/5 p-6 text-center">
                  <p className="text-sm text-ink/60">아직 접속한 학생이 없어요</p>
                  <p className="text-[11px] text-ink/40 mt-1">첫 타자가 되어볼까요? 🐣</p>
                </div>

              ) : (
                <div className="space-y-3">
                  {groupList.map(([campus, members]) => (
                    <div key={campus} className="bg-sheet rounded-[28px] ring-1 ring-black/5 overflow-hidden">
                      <div className="flex items-center justify-between px-5 pt-4 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-ink/70">{campus}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sticker-blue/40 text-ink/70 font-semibold tabular-nums">
                            {members.length}
                          </span>
                        </div>
                      </div>
                      <div className="divide-y divide-zinc-950/5">
                        {members.map(f => {
                          const c = f.character_type ? CHARACTERS[f.character_type] : null;
                          const isFriend = friendIds?.has(f.user_id);
                          const petSrc = c ? characterImage(f.character_type!, f.exp ?? 0) : null;
                          return (
                            <div key={f.user_id} className="p-4 flex items-center gap-3">
                              <div className={`relative size-12 rounded-2xl ring-1 ring-black/5 grid place-items-center shrink-0 overflow-hidden ${f.avatar_url ? "bg-paper" : (c ? c.bg : "bg-sticker-pink/40")}`}>
                                {f.avatar_url ? (
                                  <img src={f.avatar_url} alt={f.full_name ?? f.display_name} className="size-full object-cover" />
                                ) : petSrc ? (
                                  <img src={petSrc} alt={c?.name ?? "pet"} className="size-10 object-contain relative" />
                                ) : (
                                  <span className="text-2xl">{f.avatar_emoji}</span>
                                )}
                                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-sheet animate-pulse" />
                              </div>
                              <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="text-sm font-semibold truncate">{f.full_name ?? f.display_name}</p>
                                  {f.class_name && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-paper text-ink/60 font-medium shrink-0">{f.class_name}</span>
                                  )}
                                  {f.school && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-paper text-ink/60 font-medium shrink-0">{f.school}</span>
                                  )}
                                  {f.grade && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium shrink-0">{f.grade}</span>
                                  )}
                                  {isFriend && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium shrink-0">친구</span>
                                  )}
                                </div>
                                <p className="text-xs text-ink/50 truncate">
                                  {f.subject_name ? `📚 ${f.subject_name}` : (c ? `${c.name} · 공부 중` : "공부 중")}
                                </p>
                              </div>
                              {f.started_at && <SubjectLiveStats startIso={f.started_at} todayBaseline={f.subject_today_baseline} totalBaseline={f.subject_total_baseline} />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })()}

        {user && <TodayRanking userId={user.id} friendIds={friendIds} myLiveSeconds={sessionSeconds} periodId={period?.id ?? null} periodName={period?.name ?? null} />}
      </main>

      {user && <BottomNav />}
    </div>
  );
}

function LiveTimer({ startIso }: { startIso: string }) {
  const [sec, setSec] = useState(() => Math.max(0, Math.floor((Date.now() - new Date(startIso).getTime()) / 1000)));
  useEffect(() => {
    const id = window.setInterval(() => {
      setSec(Math.max(0, Math.floor((Date.now() - new Date(startIso).getTime()) / 1000)));
    }, 1000);
    return () => window.clearInterval(id);
  }, [startIso]);
  return <span className="text-xs font-semibold tabular-nums text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{formatTimer(sec)}</span>;
}

function SubjectLiveStats({ startIso, todayBaseline, totalBaseline }: { startIso: string; todayBaseline: number | null; totalBaseline: number | null }) {
  const [sec, setSec] = useState(() => Math.max(0, Math.floor((Date.now() - new Date(startIso).getTime()) / 1000)));
  useEffect(() => {
    const id = window.setInterval(() => {
      setSec(Math.max(0, Math.floor((Date.now() - new Date(startIso).getTime()) / 1000)));
    }, 1000);
    return () => window.clearInterval(id);
  }, [startIso]);
  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <span className="text-xs font-semibold tabular-nums text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{formatTimer(sec)}</span>
      <div className="flex gap-1.5 text-[9px] text-ink/50 tabular-nums">
        {typeof todayBaseline === "number" && <span>오늘 {formatTimer(todayBaseline + sec)}</span>}
        {typeof totalBaseline === "number" && <span>· 누적 {formatTimer(totalBaseline + sec)}</span>}
      </div>
    </div>
  );
}



function TodayRanking({ userId, friendIds, myLiveSeconds, periodId, periodName }: { userId: string; friendIds: Set<string> | undefined; myLiveSeconds: number; periodId: string | null; periodName: string | null }) {
  const ids = [userId, ...Array.from(friendIds ?? [])];
  const { data } = useQuery({
    queryKey: ["total-ranking", userId, ids.join(",")],
    enabled: ids.length > 0,
    refetchInterval: 30000,
    queryFn: async () => {
      const [{ data: profiles }, { data: sessions }] = await Promise.all([
        supabase.from("profiles").select("id,display_name,full_name,avatar_emoji,avatar_url,character_type,campus,class_name,grade,school").in("id", ids),
        supabase.from("study_sessions").select("user_id,duration_seconds").in("user_id", ids),
      ]);
      const totals = new Map<string, number>();
      for (const s of sessions ?? []) totals.set(s.user_id, (totals.get(s.user_id) ?? 0) + s.duration_seconds);
      return (profiles ?? []).map(p => ({
        id: p.id,
        display_name: p.display_name as string,
        full_name: (p as { full_name?: string | null }).full_name ?? null,
        avatar_emoji: p.avatar_emoji as string,
        avatar_url: (p as { avatar_url?: string | null }).avatar_url ?? null,
        character_type: p.character_type as CharacterType | null,
        campus: p.campus as string | null,
        class_name: p.class_name as string | null,
        grade: p.grade as string | null,
        school: (p as { school?: string | null }).school ?? null,
        total: totals.get(p.id) ?? 0,
      }));
    },
  });

  const ranked = (data ?? [])
    .map(p => ({ ...p, total: p.id === userId ? p.total + myLiveSeconds : p.total }))
    .sort((a, b) => b.total - a.total);
  const medals = ["🥇", "🥈", "🥉"];
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null);

  return (
    <section className="mt-8">
      <div className="flex justify-between items-end mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <h3 className="text-lg font-semibold font-display">누적 랭킹</h3>
          <span className="text-xs text-ink/40">전체 기간</span>
        </div>
        <Link to="/friends" className="text-xs font-medium text-accent">전체 보기</Link>
      </div>
      {ranked.length === 0 ? (
        <div className="bg-sheet rounded-[28px] ring-1 ring-black/5 p-6 text-center">
          <p className="text-sm text-ink/60">아직 기록이 없어요</p>
          <p className="text-[11px] text-ink/40 mt-1">친구를 추가하고 함께 경쟁해요</p>
        </div>
      ) : (
        <div className="bg-sheet rounded-[28px] ring-1 ring-black/5 divide-y divide-zinc-950/5">
          {ranked.slice(0, 10).map((p, i) => {
            const c = p.character_type ? CHARACTERS[p.character_type] : null;
            const isMe = p.id === userId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected({ id: p.id, name: p.full_name ?? p.display_name })}
                className={"w-full text-left p-4 flex items-center gap-3 hover:bg-paper/60 transition " + (isMe ? "bg-accent/5" : "")}
              >
                <span className="w-7 text-center font-display font-semibold text-sm tabular-nums">
                  {medals[i] ?? i + 1}
                </span>
                <div className={`size-10 rounded-2xl ring-1 ring-black/5 grid place-items-center shrink-0 overflow-hidden ${p.avatar_url ? "bg-paper" : (c ? c.bg : "bg-sticker-pink/40")}`}>
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.full_name ?? p.display_name} className="size-full object-cover" />
                  ) : c ? (
                    <img src={c.stages[0]} alt="" width={40} height={40} className="size-8 object-contain" />
                  ) : (
                    <span className="text-xl">{p.avatar_emoji}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-semibold truncate">
                      {p.full_name ?? p.display_name} {isMe && <span className="text-xs text-accent">(나)</span>}
                    </p>
                    {[p.class_name, p.school, p.campus].filter(Boolean).map((v, idx) => (
                      <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded-full bg-paper ring-1 ring-black/5 text-ink/60 shrink-0">
                        {v}
                      </span>
                    ))}
                    {p.grade && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium shrink-0">{p.grade}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-ink/50 tabular-nums">{formatTotal(p.total)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
      <StudentDetailDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        userId={selected?.id ?? null}
        name={selected?.name ?? ""}
      />
    </section>
  );
}

function StudentDetailDialog({ open, onClose, userId, name }: { open: boolean; onClose: () => void; userId: string | null; name: string }) {
  const { data: photos } = useQuery({
    queryKey: ["student-photos", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_photos")
        .select("id,photo_url,caption,created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["student-stats", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_sessions")
        .select("duration_seconds,subject_id,subjects(name,color)")
        .eq("user_id", userId!);
      if (error) throw error;
      const map = new Map<string, { name: string; color: string; total: number }>();
      let total = 0;
      for (const s of data ?? []) {
        const subj = (s as { subjects: { name: string; color: string } | null }).subjects;
        const key = s.subject_id;
        const cur = map.get(key) ?? { name: subj?.name ?? "기타", color: subj?.color ?? "pink", total: 0 };
        cur.total += s.duration_seconds;
        map.set(key, cur);
        total += s.duration_seconds;
      }
      return { list: Array.from(map.values()).sort((a, b) => b.total - a.total), total };
    },
  });

  // group photos by date (Asia/Seoul date)
  const photosByDate = new Map<string, typeof photos>();
  for (const p of photos ?? []) {
    const d = new Date(p.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
    if (!photosByDate.has(d)) photosByDate.set(d, []);
    photosByDate.get(d)!.push(p);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-sheet">
        <DialogHeader>
          <DialogTitle className="font-display">{name} 학생</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="bg-gradient-to-r from-primary/15 to-accent/10 rounded-[24px] p-5 ring-1 ring-primary/20 text-center">
            <span className="text-[11px] font-medium text-ink/60 block mb-1">전체 누적 공부시간</span>
            <span className="text-3xl font-semibold font-display tabular-nums text-primary">{formatTotal(stats?.total ?? 0)}</span>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <h4 className="text-sm font-semibold text-ink/80">📊 과목별 통계</h4>
              <span className="text-[11px] text-ink/50 tabular-nums">합계 {formatTotal(stats?.total ?? 0)}</span>
            </div>
            {(stats?.list.length ?? 0) === 0 ? (
              <p className="text-xs text-ink/40 text-center py-4">아직 기록이 없어요</p>
            ) : (
              <div className="space-y-2">
                {stats!.list.map((s, idx) => {
                  const pct = stats!.total > 0 ? (s.total / stats!.total) * 100 : 0;
                  const bg = STICKER_BG[s.color as keyof typeof STICKER_BG] ?? "bg-sticker-pink/40";
                  const bar = STICKER_BAR[s.color as keyof typeof STICKER_BAR] ?? "bg-sticker-pink";
                  return (
                    <div key={idx} className={`${bg} rounded-2xl p-3`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-ink/80">{s.name}</span>
                        <span className="text-[11px] tabular-nums text-ink/60">{formatTotal(s.total)} · {pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                        <div className={`h-full ${bar}`} style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink/80 mb-2">📸 공부 인증 사진</h4>
            {(photos?.length ?? 0) === 0 ? (
              <p className="text-xs text-ink/40 text-center py-4">아직 인증 사진이 없어요</p>
            ) : (
              <div className="space-y-4">
                {Array.from(photosByDate.entries()).map(([date, items]) => (
                  <div key={date}>
                    <p className="text-[11px] font-medium text-ink/50 mb-1.5">{date}</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {items!.map(p => (
                        <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-paper ring-1 ring-black/5">
                          <img src={p.photo_url} alt={p.caption ?? "공부 인증"} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


