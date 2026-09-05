import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
import { formatTotal } from "@/lib/format";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { UserPlus, Trash2 } from "lucide-react";
import { CHARACTERS, CharacterType, characterImage } from "@/lib/character";
import { useCurrentExamPeriod } from "@/lib/exam-period";
import { getGlobalRanking } from "@/lib/rankings.functions";
import kingMath from "@/assets/king-math.png";
import kingEnglish from "@/assets/king-english.png";
import kingKorean from "@/assets/king-korean.png";
import kingExplore from "@/assets/king-explore.png";

export const Route = createFileRoute("/_authenticated/friends")({
  component: Friends,
  head: () => ({
    meta: [
      { title: "친구 랭킹 — 옳품타" },
      { name: "description", content: "옳품타 친구들과 오늘의 공부 시간을 비교하고 함께 동기부여 받아요." },
    ],
  }),
});

type OnlineUser = {
  user_id: string;
  display_name: string;
  avatar_emoji: string;
  avatar_url: string | null;
  character_type: CharacterType | null;
  subject_name: string | null;
  running: boolean;
  started_at: string | null;
  campus?: string | null;
  school?: string | null;
  grade?: string | null;
  class_name?: string | null;
};

type CategoryKey = "math" | "english" | "korean" | "explore";
const CATEGORY_LABEL: Record<CategoryKey, string> = {
  math: "수학왕",
  english: "영어왕",
  korean: "국어왕",
  explore: "탐구왕",
};
const CATEGORY_ICON: Record<CategoryKey, string> = {
  math: kingMath,
  english: kingEnglish,
  korean: kingKorean,
  explore: kingExplore,
};

function classifySubject(name: string): CategoryKey {
  const n = name.replace(/\s+/g, "");
  if (n === "수학" || n.includes("수학")) return "math";
  if (n === "영어" || n.includes("영어")) return "english";
  if (n === "국어" || n.includes("국어")) return "korean";
  return "explore";
}

function Friends() {
  return <FriendsInner />;
}

function FriendsInner() {
  const { user } = useAuth();
  const { data: period } = useCurrentExamPeriod();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [online, setOnline] = useState<OnlineUser[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const myPresenceBaseRef = useRef<Omit<OnlineUser, "subject_name" | "running" | "started_at"> | null>(null);
  const [rankPage, setRankPage] = useState(1);
  const RANK_PER_PAGE = 10;

  const { data: friendIds } = useQuery({
    queryKey: ["friend-ids-list", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("friendships").select("friend_id");
      if (error) throw error;
      return (data ?? []).map((r) => r.friend_id);
    },
  });

  // 현재 진행 중인 세션 (홈에서 localStorage로 동기화)
  const [myRunningSession, setMyRunningSession] = useState<{ started_at: string; subject_name: string } | null>(null);
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("oth-running-session");
        if (!raw) { setMyRunningSession(null); return; }
        const v = JSON.parse(raw);
        if (v && typeof v.subject_name === "string" && typeof v.started_at === "string") {
          setMyRunningSession({ subject_name: v.subject_name, started_at: v.started_at });
        } else {
          setMyRunningSession(null);
        }
      } catch { setMyRunningSession(null); }
    };
    read();
    const id = window.setInterval(read, 3000);
    window.addEventListener("storage", read);
    return () => { window.clearInterval(id); window.removeEventListener("storage", read); };
  }, []);

  // 실시간 접속 (presence)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name,avatar_emoji,avatar_url,character_type,campus,school,grade,class_name")
        .eq("id", user.id)
        .single();
      if (cancelled || !prof) return;
      const channel = supabase.channel("online-users", { config: { presence: { key: user.id } } });
      channelRef.current = channel;
      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState<OnlineUser>();
          const list: OnlineUser[] = [];
          for (const k in state) {
            const e = state[k]?.[0];
            if (e) list.push(e);
          }
          setOnline(list);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            const base = {
              user_id: user.id,
              display_name: prof.display_name,
              avatar_emoji: prof.avatar_emoji,
              avatar_url: prof.avatar_url,
              character_type: prof.character_type as CharacterType | null,
              campus: prof.campus,
              school: prof.school,
              grade: prof.grade,
              class_name: prof.class_name,
            } satisfies Omit<OnlineUser, "subject_name" | "running" | "started_at">;
            myPresenceBaseRef.current = base;
            await channel.track({
              ...base,
              subject_name: myRunningSession?.subject_name ?? null,
              running: !!myRunningSession,
              started_at: myRunningSession?.started_at ?? null,
            } satisfies OnlineUser);
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

  useEffect(() => {
    const channel = channelRef.current;
    const base = myPresenceBaseRef.current;
    if (!channel || !base) return;
    channel.track({
      ...base,
      subject_name: myRunningSession?.subject_name ?? null,
      running: !!myRunningSession,
      started_at: myRunningSession?.started_at ?? null,
    } satisfies OnlineUser);
  }, [myRunningSession]);

  // 전체 학생 누적/과목별/소속 — 서버 함수로 RLS 우회하여 모든 학생 집계
  const fetchGlobalRanking = useServerFn(getGlobalRanking);
  const { data: ranking } = useQuery({
    queryKey: ["global-ranking", period?.id ?? "none"],
    enabled: !!user && !!period,
    refetchInterval: 30000,
    queryFn: async () => {
      const rows = await fetchGlobalRanking({ data: { periodId: period?.id ?? null } });
      return rows.map((r) => ({
        ...r,
        character_type: r.character_type as CharacterType | null,
        isMe: r.id === user!.id,
      }));
    },
  });

  const { data: searchResults } = useQuery({
    queryKey: ["search-friends", search],
    enabled: search.length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,display_name,avatar_emoji,campus,class_name,school,grade")
        .ilike("display_name", `%${search}%`)
        .neq("id", user!.id)
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const addFriend = async (friendId: string) => {
    const { error } = await supabase.from("friendships").insert({ user_id: user!.id, friend_id: friendId });
    if (error) toast.error(error.message);
    else {
      toast.success("친구 추가 완료!");
      setSearch("");
      qc.invalidateQueries({ queryKey: ["friend-ids"] });
      qc.invalidateQueries({ queryKey: ["friend-ranking"] });
    }
  };

  const removeFriend = async (friendId: string) => {
    const { error } = await supabase.from("friendships").delete().eq("user_id", user!.id).eq("friend_id", friendId);
    if (error) toast.error(error.message);
    else {
      qc.invalidateQueries({ queryKey: ["friend-ids"] });
      qc.invalidateQueries({ queryKey: ["friend-ranking"] });
    }
  };

  const friendSet = new Set(friendIds ?? []);
  // 접속한 모든 학생 표시 (본인 우선 정렬)
  const onlineFriendsAndMe = online.slice().sort((a, b) => {
    if (a.user_id === user?.id) return -1;
    if (b.user_id === user?.id) return 1;
    return 0;
  });
  const medals = ["🥇", "🥈", "🥉"];
  const totalSorted = (ranking ?? []).slice().sort((a, b) => b.total - a.total);
  const myRank = totalSorted.findIndex((r) => r.isMe) + 1;
  const myRankData = totalSorted.find((r) => r.isMe);

  // 소속별 그룹 랭킹
  const byCampus = new Map<string, typeof totalSorted>();
  for (const r of totalSorted) {
    const key = r.campus ?? "미지정";
    if (!byCampus.has(key)) byCampus.set(key, []);
    byCampus.get(key)!.push(r);
  }
  const campusGroups = Array.from(byCampus.entries()).sort(
    (a, b) => b[1].reduce((x, r) => x + r.total, 0) - a[1].reduce((x, r) => x + r.total, 0),
  );

  // 카테고리 왕
  const cats: CategoryKey[] = ["math", "english", "korean", "explore"];

  return (
    <div className="min-h-screen bg-paper text-ink pb-32">
      <header className="max-w-md mx-auto pt-10 px-6">
        <h1 className="text-2xl font-semibold font-display">친구 랭킹</h1>
        <p className="text-sm text-ink/60">오늘 누적 · 소속별 · 과목별 왕</p>
      </header>

      <main className="max-w-md mx-auto px-6 mt-6 space-y-6">
        {/* 검색/추가 */}
        <section className="bg-sheet rounded-[24px] ring-1 ring-black/5 p-5">
          <input
            type="text"
            placeholder="닉네임으로 친구 찾기"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 px-4 rounded-2xl bg-paper ring-1 ring-black/10 text-sm focus:outline-none focus:ring-accent"
          />
          {searchResults && searchResults.length > 0 && (
            <div className="mt-3 space-y-1">
              {searchResults.map((p) => {
                const already = friendIds?.includes(p.id);
                return (
                  <div key={p.id} className="flex items-center gap-3 py-2">
                    <span className="text-2xl">{p.avatar_emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.display_name}</p>
                      <p className="text-[10px] text-ink/40">
                        {[p.campus, p.grade, p.school, p.class_name].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                    <button
                      onClick={() => !already && addFriend(p.id)}
                      disabled={already}
                      className="px-3 h-8 rounded-full bg-accent text-sheet text-xs font-semibold disabled:opacity-40 flex items-center gap-1"
                    >
                      <UserPlus className="size-3" /> {already ? "친구" : "추가"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 실시간 접속중 친구 */}
        <section className="bg-sheet rounded-[28px] ring-1 ring-black/5 p-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-semibold font-display">실시간 접속중인 친구</h2>
            <span className="text-[11px] text-accent font-semibold">{onlineFriendsAndMe.length}명</span>
          </div>
          {onlineFriendsAndMe.length === 0 ? (
            <p className="text-xs text-ink/40 text-center py-6">접속 중인 친구가 없어요</p>
          ) : (
            <div className="space-y-2">
              {onlineFriendsAndMe.map((u) => {
                const c = u.character_type ? CHARACTERS[u.character_type] : null;
                const isMe = u.user_id === user?.id;
                return (
                  <div key={u.user_id} className="flex items-center gap-3 p-2 rounded-2xl">
                    <div className={`relative size-10 rounded-2xl grid place-items-center shrink-0 overflow-hidden ${c?.bg ?? "bg-paper"}`}>
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="size-10 object-cover" />
                      ) : c ? (
                        <img src={characterImage(u.character_type!, 0)} alt="" className="mon-anim-sm size-8 object-contain" />
                      ) : (
                        <span className="text-xl">{u.avatar_emoji}</span>
                      )}
                      {u.running && <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-sticker-green ring-2 ring-sheet animate-pulse" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {u.display_name} {isMe && <span className="text-[10px] text-accent">(나)</span>}
                      </p>
                      <p className="text-[10px] text-ink/50 truncate">
                        {u.subject_name
                          ? `${u.subject_name} 공부 중`
                          : [u.campus, u.grade, u.school, u.class_name].filter(Boolean).join(" · ") || "대기 중"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 과목별 왕 */}
        <section className="bg-sheet rounded-[28px] ring-1 ring-black/5 p-5">
          <h2 className="text-sm font-semibold font-display mb-3">오늘의 과목왕 👑</h2>

          {/* 종합왕 — 전과목 합산 1위 */}
          {(() => {
            const overall = totalSorted[0];
            const hasOverall = overall && overall.total > 0;
            return (
              <div className="mb-3 p-4 rounded-2xl bg-gradient-to-br from-accent/15 via-sticker-yellow/20 to-sticker-pink/15 ring-1 ring-accent/30 relative overflow-hidden">
                <div className="absolute top-2 right-3 text-2xl">👑</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-accent">종합왕</span>
                  <span className="text-[10px] text-ink/50">전과목 합산 1위</span>
                </div>
                {hasOverall ? (
                  <div className="mt-2">
                    <div className="flex items-baseline gap-3">
                      <p className="text-base font-bold truncate">{overall.full_name ?? overall.display_name}</p>
                      <p className="text-xs text-ink/60 tabular-nums">{formatTotal(overall.total)}</p>
                    </div>
                    <p className="text-[10px] text-ink/50 mt-1">
                      {[overall.campus, overall.grade, overall.school, overall.class_name].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] text-ink/40">아직 기록 없음</p>
                )}
              </div>
            );
          })()}
          <div className="grid grid-cols-2 gap-2">
            {cats.map((cat) => {
              const sorted = (ranking ?? []).slice().sort((a, b) => b.cats[cat] - a.cats[cat]);
              const king = sorted[0];
              const hasData = king && king.cats[cat] > 0;
              return (
                <div key={cat} className="p-3 rounded-2xl bg-paper relative overflow-hidden">
                  <div className="flex items-center gap-2">
                    <img src={CATEGORY_ICON[cat]} alt="" loading="lazy" width={48} height={48} className="size-8 object-contain drop-shadow-sm" />
                    <span className="text-xs font-semibold text-accent">{CATEGORY_LABEL[cat]}</span>
                  </div>
                  {hasData ? (
                    <>
                      <p className="mt-2 text-sm font-semibold truncate">{king.full_name ?? king.display_name}</p>
                      <p className="text-[10px] text-ink/50">
                        {[king.campus, king.grade, king.school, king.class_name].filter(Boolean).join(" · ") || "—"}
                      </p>
                      <p className="text-[10px] text-ink/50 tabular-nums">{formatTotal(king.cats[cat])}</p>
                    </>
                  ) : (
                    <p className="mt-2 text-[11px] text-ink/40">아직 기록 없음</p>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-ink/40 mt-3">탐구왕 = 수학·영어·국어 외 모든 과목 합산</p>
        </section>

        {/* 소속별 랭킹 */}
        <section className="bg-sheet rounded-[28px] ring-1 ring-black/5 p-5">
          <h2 className="text-sm font-semibold font-display mb-3">소속별 랭킹</h2>
          {campusGroups.length === 0 && (
            <p className="text-xs text-ink/40 text-center py-4">친구를 추가해보세요</p>
          )}
          <div className="space-y-4">
            {campusGroups.map(([campus, members]) => (
              <div key={campus}>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-semibold text-ink/70">{campus}</span>
                  <span className="text-[10px] text-ink/40 tabular-nums">
                    합 {formatTotal(members.reduce((a, r) => a + r.total, 0))}
                  </span>
                </div>
                <div className="divide-y divide-zinc-950/5">
                  {members.map((p, i) => (
                    <div key={p.id} className={"py-2 flex items-center gap-3 " + (p.isMe ? "bg-accent/5 -mx-2 px-2 rounded-xl" : "")}>
                      <span className="w-5 text-center font-display font-semibold text-xs">{medals[i] ?? `${i + 1}`}</span>
                      {p.character_type ? (
                        <img src={characterImage(p.character_type, p.character_exp)} alt="" loading="lazy" className="size-8 object-contain" />
                      ) : (
                        <span className="text-lg">{p.avatar_emoji}</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">
                          {p.full_name ?? p.display_name}
                        </p>
                        <p className="text-[10px] text-ink/50">
                          {[p.campus, p.grade, p.school, p.class_name].filter(Boolean).join(" · ") || "—"}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <img src={characterImage("lighthouse", p.character_exp ?? 0)} alt="" className="size-3.5 object-contain" />
                          <span className="text-[10px] text-ink/50 tabular-nums">{formatTotal(p.total)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 전체 랭킹 */}
        <section className="bg-sheet rounded-[28px] ring-1 ring-black/5 divide-y divide-zinc-950/5">
          <div className="p-4 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold font-display">전체 랭킹 (오늘)</h2>
            <span className="text-[10px] text-ink/40">{totalSorted.length}명</span>
          </div>
          {myRank > 0 && myRankData && (
            <div className="p-4 flex items-center gap-3 bg-accent/[0.06] border-b border-black/[0.06]">
              <span className="w-6 text-center font-display font-semibold text-sm text-accent">
                {myRank <= 3 ? medals[myRank - 1] : `${myRank}`}
              </span>
              {myRankData.avatar_url ? (
                <img src={myRankData.avatar_url} alt="" className="size-9 rounded-full object-cover ring-1 ring-black/5" />
              ) : (
                <span className="text-2xl">{myRankData.avatar_emoji}</span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {myRankData.full_name ?? myRankData.display_name} <span className="text-xs text-accent">(나)</span>
                </p>
                <p className="text-[10px] text-ink/40">
                  {[myRankData.campus, myRankData.grade, myRankData.school, myRankData.class_name].filter(Boolean).join(" · ") || "—"}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <img src={characterImage("lighthouse", myRankData.character_exp ?? 0)} alt="" className="size-4 object-contain" />
                  <span className="text-xs text-ink/50 tabular-nums">{formatTotal(myRankData.total)}</span>
                </div>
              </div>
            </div>
          )}
          {totalSorted.slice(0, rankPage * RANK_PER_PAGE).filter((p) => !(myRankData && p.isMe)).map((p) => {
            const rank = totalSorted.indexOf(p);
            return (
            <div key={p.id} className={"p-4 flex items-center gap-3 " + (p.isMe ? "bg-accent/5" : "")}>
              <span className="w-6 text-center font-display font-semibold text-sm">{medals[rank] ?? `${rank + 1}`}</span>
              {p.avatar_url ? (
                <img src={p.avatar_url} alt="" className="size-9 rounded-full object-cover ring-1 ring-black/5" />
              ) : (
                <span className="text-2xl">{p.avatar_emoji}</span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {p.full_name ?? p.display_name} {p.isMe && <span className="text-xs text-accent">(나)</span>}
                </p>
                <p className="text-[10px] text-ink/40">
                  {[p.campus, p.grade, p.school, p.class_name].filter(Boolean).join(" · ") || "—"}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <img src={characterImage("lighthouse", p.character_exp ?? 0)} alt="" className="size-4 object-contain" />
                  <span className="text-xs text-ink/50 tabular-nums">{formatTotal(p.total)}</span>
                </div>
              </div>
              {!p.isMe && friendSet.has(p.id) && (
                <button onClick={() => removeFriend(p.id)} className="text-ink/30 hover:text-destructive p-1">
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
            );
          })}

          {totalSorted.length > rankPage * RANK_PER_PAGE && (
            <button
              onClick={() => setRankPage((p) => p + 1)}
              className="w-full py-3 text-xs font-medium text-ink/60 hover:text-ink hover:bg-black/[0.02] transition"
            >
              더 보기
            </button>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
