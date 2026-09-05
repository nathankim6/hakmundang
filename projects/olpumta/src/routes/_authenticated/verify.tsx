import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/lib/admin";
import { BottomNav } from "@/components/BottomNav";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Loader2, Plus, Images, Check, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/verify")({
  component: Verify,
  head: () => ({
    meta: [
      { title: "공부 인증 — 옳품타" },
      { name: "description", content: "오늘의 공부 사진을 인증하고 친구들의 공부 현장을 구경해요." },
    ],
  }),
});

type Profile = { id: string; display_name: string; avatar_emoji: string; avatar_url?: string | null; full_name?: string | null };

function Avatar({ url, emoji, size = 32, ring = true }: { url?: string | null; emoji?: string | null; size?: number; ring?: boolean }) {
  const inner = url ? (
    <img src={url} alt="" className="size-full rounded-full object-cover" />
  ) : (
    <div className="size-full rounded-full bg-page grid place-items-center" style={{ fontSize: size * 0.5 }}>
      {emoji ?? "🐻"}
    </div>
  );
  if (!ring) return <div style={{ width: size, height: size }} className="rounded-full overflow-hidden bg-page">{inner}</div>;
  return (
    <div style={{ width: size, height: size }} className="rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
      <div className="size-full rounded-full bg-white p-[1.5px]">
        {inner}
      </div>
    </div>
  );
}

type PhotoRow = {
  id: string;
  user_id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
  profile?: Profile | null;
};

type CommentRow = {
  id: string;
  photo_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile | null;
};

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return sameYear
    ? `${d.getMonth() + 1}월 ${d.getDate()}일 (${weekday}) · ${hh}:${mm}`
    : `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 · ${hh}:${mm}`;
}

type FilterKey = "all" | "today" | "week" | "mine";

function Verify() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const qc = useQueryClient();
  const composerFileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<FilterKey>("all");

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["study_photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_photos")
        .select("id, user_id, photo_url, caption, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      const rows = (data ?? []) as Omit<PhotoRow, "profile">[];
      const ids = Array.from(new Set(rows.map((r) => r.user_id)));
      if (ids.length === 0) return [] as PhotoRow[];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_emoji, avatar_url, full_name")
        .in("id", ids);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      return rows.map((r) => ({
        ...r,
        profile: map.get(r.user_id) ?? null,
      })) as PhotoRow[];
    },
  });

  const photoIds = useMemo(() => photos.map((p) => p.id), [photos]);

  // 좋아요 전체 조회 (사진별)
  const { data: likes = [] } = useQuery({
    queryKey: ["photo_likes", photoIds],
    queryFn: async () => {
      if (photoIds.length === 0) return [] as { photo_id: string; user_id: string }[];
      const { data, error } = await supabase
        .from("photo_likes")
        .select("photo_id, user_id")
        .in("photo_id", photoIds);
      if (error) throw error;
      return data ?? [];
    },
    enabled: photoIds.length > 0,
  });

  const likeMap = useMemo(() => {
    const m = new Map<string, { count: number; mine: boolean }>();
    for (const id of photoIds) m.set(id, { count: 0, mine: false });
    for (const l of likes) {
      const cur = m.get(l.photo_id) ?? { count: 0, mine: false };
      cur.count += 1;
      if (l.user_id === user?.id) cur.mine = true;
      m.set(l.photo_id, cur);
    }
    return m;
  }, [likes, photoIds, user?.id]);

  const { data: myProfile } = useQuery({
    queryKey: ["my_profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_emoji, avatar_url, full_name")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  async function toggleLike(photoId: string, mine: boolean) {
    if (!user) return;
    if (mine) {
      await supabase.from("photo_likes").delete().eq("photo_id", photoId).eq("user_id", user.id);
    } else {
      await supabase.from("photo_likes").insert({ photo_id: photoId, user_id: user.id });
    }
    qc.invalidateQueries({ queryKey: ["photo_likes"] });
  }

  async function handleFiles(files: File[]) {
    if (!user || files.length === 0) return;
    const MAX = 20;
    let list = files;
    if (list.length > MAX) {
      toast.error(`최대 ${MAX}장까지 업로드할 수 있어요`);
      list = list.slice(0, MAX);
    }
    setUploading(true);
    let success = 0;
    let failed = 0;
    try {
      for (const file of list) {
        if (!file.type.startsWith("image/")) { failed++; continue; }
        if (file.size > 10 * 1024 * 1024) { failed++; continue; }
        try {
          const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
          const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from("study-photos")
            .upload(path, file, { contentType: file.type, upsert: false });
          if (upErr) throw upErr;
          const { data: pub } = supabase.storage.from("study-photos").getPublicUrl(path);
          const { error: insErr } = await supabase.from("study_photos").insert({
            user_id: user.id,
            photo_url: pub.publicUrl,
            caption: caption.trim() || null,
          });
          if (insErr) throw insErr;
          success++;
        } catch (e) {
          console.error(e);
          failed++;
        }
      }
      if (success > 0) {
        toast.success(`${success}장 게시 완료! 🎉${failed > 0 ? ` (${failed}장 실패)` : ""}`);
        setCaption("");
        qc.invalidateQueries({ queryKey: ["study_photos"] });
      } else {
        toast.error("업로드에 실패했어요");
      }
    } finally {
      setUploading(false);
      if (composerFileRef.current) composerFileRef.current.value = "";
    }
  }

  async function handleDeleteGroup(group: PhotoRow[]) {
    if (!user) return;
    const canDelete = group.every((p) => p.user_id === user.id) || isAdmin;
    if (!canDelete) return;
    if (!confirm(group.length > 1 ? `사진 ${group.length}장을 모두 삭제할까요?` : "이 게시물을 삭제할까요?")) return;
    try {
      for (const p of group) {
        const url = new URL(p.photo_url);
        const marker = "/study-photos/";
        const idx = url.pathname.indexOf(marker);
        const path = idx >= 0 ? url.pathname.slice(idx + marker.length) : null;
        if (path) await supabase.storage.from("study-photos").remove([path]);
        await supabase.from("study_photos").delete().eq("id", p.id);
      }
      qc.invalidateQueries({ queryKey: ["study_photos"] });
    } catch (e) {
      console.error(e);
      toast.error("삭제에 실패했어요");
    }
  }

  async function handleEditCaption(p: PhotoRow, newCaption: string) {
    const { error } = await supabase
      .from("study_photos")
      .update({ caption: newCaption.trim() || null })
      .eq("id", p.id);
    if (error) {
      toast.error("수정에 실패했어요");
      return;
    }
    qc.invalidateQueries({ queryKey: ["study_photos"] });
  }

  const todayCount = photos.filter((p) => isToday(p.created_at)).length;

  const filteredPhotos = useMemo(() => {
    const now = Date.now();
    return photos.filter((p) => {
      if (filter === "today") return isToday(p.created_at);
      if (filter === "week") return now - new Date(p.created_at).getTime() < 7 * 86400 * 1000;
      if (filter === "mine") return p.user_id === user?.id;
      return true;
    });
  }, [photos, filter, user?.id]);

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "전체", count: photos.length },
    { key: "today", label: "오늘", count: todayCount },
    { key: "week", label: "이번 주", count: photos.filter((p) => Date.now() - new Date(p.created_at).getTime() < 7 * 86400 * 1000).length },
    { key: "mine", label: "내 인증", count: photos.filter((p) => p.user_id === user?.id).length },
  ];


  return (
    <div className="min-h-screen bg-paper text-ink pb-32">
      <header className="max-w-md mx-auto pt-10 px-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold font-display">공부 인증</h1>
          <p className="text-sm text-ink/60">오늘의 공부 기록을 사진으로 남겨요</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/gallery"
            className="size-10 rounded-full bg-black/[0.05] hover:bg-black/[0.08] text-ink grid place-items-center transition"
            aria-label="내 갤러리"
          >
            <Images className="size-5" strokeWidth={2.2} />
          </Link>
          <button
            type="button"
            onClick={() => composerFileRef.current?.click()}
            disabled={uploading}
            className="size-10 rounded-full bg-ink text-sheet grid place-items-center shadow-sm hover:opacity-90 transition disabled:opacity-50"
            aria-label="새 게시물"
          >
            {uploading ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5" strokeWidth={2.4} />}
          </button>
        </div>
      </header>

      <input
        ref={composerFileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const fs = Array.from(e.target.files ?? []);
          if (fs.length) handleFiles(fs);
        }}
      />

      <div className="max-w-md mx-auto">
        {caption.length > 0 && (
          <div className="px-4 py-2 text-[11px] text-ink/50 border-b border-black/[0.06]">
            다음 인증 코멘트: <span className="text-ink/80">"{caption}"</span>
          </div>
        )}
        <div className="px-4 py-3 border-b border-black/[0.06]">
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 100))}
            placeholder="다음 인증샷에 달릴 한 줄 코멘트 (선택)"
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink/40 outline-none"
          />
        </div>

        <div className="sticky top-14 z-20 bg-white/95 backdrop-blur border-b border-black/[0.06]">
          <div className="flex gap-2 overflow-x-auto px-4 py-2.5 no-scrollbar">
            {filterTabs.map((t) => {
              const active = filter === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition ${
                    active
                      ? "bg-ink text-white"
                      : "bg-black/[0.05] text-ink/70 hover:bg-black/[0.08]"
                  }`}
                >
                  {t.label}
                  <span className={`ml-1.5 text-[11px] ${active ? "text-white/70" : "text-ink/40"}`}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <section>
          {isLoading ? (
            <p className="text-sm text-ink/40 text-center py-12">불러오는 중…</p>
          ) : filteredPhotos.length === 0 ? (
            <div className="text-center py-16 px-8">
              <Camera className="size-12 mx-auto text-ink/30 mb-3" />
              <p className="text-sm text-ink/50">
                {filter === "all" ? "아직 게시물이 없어요" : "조건에 맞는 게시물이 없어요"}
              </p>
              <p className="text-xs text-ink/40 mt-1">
                {filter === "mine" ? "첫 번째 인증을 남겨보세요!" : "다른 필터를 선택해보세요"}
              </p>
            </div>
          ) : (
            (() => {
              // group consecutive photos uploaded together (same user, same caption, within 30s)
              const groups: PhotoRow[][] = [];
              for (const p of filteredPhotos) {
                const last = groups[groups.length - 1];
                if (
                  last &&
                  last[0].user_id === p.user_id &&
                  (last[0].caption ?? "") === (p.caption ?? "") &&
                  Math.abs(new Date(last[0].created_at).getTime() - new Date(p.created_at).getTime()) < 30000
                ) {
                  last.push(p);
                } else {
                  groups.push([p]);
                }
              }
              return groups.map((group) => {
                const head = group[0];
                const lk = likeMap.get(head.id) ?? { count: 0, mine: false };
                const isSaved = !!saved[head.id];
                const isMine = user?.id === head.user_id;
                return (
                  <PostCard
                    key={head.id}
                    p={head}
                    photos={group}
                    isMine={isMine}
                    isAdmin={isAdmin}
                    myProfile={myProfile ?? null}
                    likeCount={lk.count}
                    liked={lk.mine}
                    onToggleLike={() => toggleLike(head.id, lk.mine)}
                    isSaved={isSaved}
                    onToggleSave={() => setSaved((s) => ({ ...s, [head.id]: !s[head.id] }))}
                    onDelete={() => handleDeleteGroup(group)}
                    onEditCaption={(caption) => handleEditCaption(head, caption)}
                    currentUserId={user?.id ?? null}
                  />
                );
              });
            })()
          )}
        </section>

        {photos.length > 0 && (
          <p className="text-center text-[11px] text-ink/40 py-6">
            오늘 {todayCount}명이 인증했어요
          </p>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function PostCard({
  p,
  photos,
  isMine,
  isAdmin,
  myProfile,
  likeCount,
  liked,
  onToggleLike,
  isSaved,
  onToggleSave,
  onDelete,
  onEditCaption,
  currentUserId,
}: {
  p: PhotoRow;
  photos: PhotoRow[];
  isMine: boolean;
  isAdmin: boolean;
  myProfile: Profile | null;
  likeCount: number;
  liked: boolean;
  onToggleLike: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  onDelete: () => void;
  onEditCaption: (caption: string) => void;
  currentUserId: string | null;
}) {
  const qc = useQueryClient();
  const [showAll, setShowAll] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState(p.caption ?? "");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const canManagePost = isMine || isAdmin;

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const { data: comments = [] } = useQuery({
    queryKey: ["photo_comments", p.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photo_comments")
        .select("id, photo_id, user_id, content, created_at")
        .eq("photo_id", p.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as Omit<CommentRow, "profile">[];
      const ids = Array.from(new Set(rows.map((r) => r.user_id)));
      if (ids.length === 0) return rows as CommentRow[];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_emoji, avatar_url, full_name")
        .in("id", ids);
      const map = new Map((profs ?? []).map((x) => [x.id, x]));
      return rows.map((r) => ({ ...r, profile: map.get(r.user_id) ?? null })) as CommentRow[];
    },
  });

  async function submitComment() {
    if (!currentUserId) return;
    const content = draft.trim();
    if (!content) return;
    setSending(true);
    try {
      const { error } = await supabase
        .from("photo_comments")
        .insert({ photo_id: p.id, user_id: currentUserId, content });
      if (error) throw error;
      setDraft("");
      qc.invalidateQueries({ queryKey: ["photo_comments", p.id] });
    } catch (e) {
      console.error(e);
      toast.error("댓글 등록에 실패했어요");
    } finally {
      setSending(false);
    }
  }

  async function deleteComment(id: string) {
    try {
      await supabase.from("photo_comments").delete().eq("id", id);
      qc.invalidateQueries({ queryKey: ["photo_comments", p.id] });
    } catch (e) {
      console.error(e);
    }
  }

  async function editComment(id: string, content: string) {
    const { error } = await supabase
      .from("photo_comments")
      .update({ content })
      .eq("id", id);
    if (error) {
      toast.error("댓글 수정에 실패했어요");
      return;
    }
    qc.invalidateQueries({ queryKey: ["photo_comments", p.id] });
  }

  const visible = showAll ? comments : comments.slice(-2);

  return (
    <article className="border-b border-black/[0.06] pb-3">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <Avatar
          size={32}
          url={p.profile?.avatar_url ?? (isMine ? myProfile?.avatar_url : null)}
          emoji={p.profile?.avatar_emoji ?? (isMine ? myProfile?.avatar_emoji : null)}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-ink truncate leading-tight">
            {p.profile?.display_name ?? (isMine ? myProfile?.display_name : null) ?? "공부친구"}
          </p>
          <p className="text-[11px] text-ink/50 leading-tight">공부 인증</p>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-ink/70 hover:text-ink p-1"
            aria-label="더보기"
          >
            <MoreHorizontal className="size-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-30 min-w-[140px] bg-sheet rounded-xl shadow-lg ring-1 ring-black/10 py-1 text-[13px] overflow-hidden">
              {canManagePost ? (
                <>
                  <button
                    onClick={() => {
                      setCaptionDraft(p.caption ?? "");
                      setEditingCaption(true);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-paper text-ink"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(); }}
                    className="w-full text-left px-3 py-2 hover:bg-paper text-red-500 font-semibold"
                  >
                    삭제
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-3 py-2 hover:bg-paper text-ink/60"
                >
                  닫기
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className="relative w-full"
        onDoubleClick={() => {
          if (!liked) onToggleLike();
        }}
      >
        <div
          ref={scrollerRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            const w = el.clientWidth;
            if (w > 0) setActiveIdx(Math.round(el.scrollLeft / w));
          }}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        >
          {photos.map((ph, i) => (
            <button
              key={ph.id}
              type="button"
              onClick={() => setLightboxIdx(i)}
              className="snap-start shrink-0 w-full block"
              aria-label={`사진 ${i + 1} 확대`}
            >
              <img
                src={ph.photo_url}
                alt={ph.caption ?? "공부 인증샷"}
                loading="lazy"
                className="w-full aspect-square object-cover bg-page"
              />
            </button>
          ))}
        </div>
        {photos.length > 1 && (
          <>
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/55 text-white text-[11px] font-semibold tabular-nums">
              {activeIdx + 1} / {photos.length}
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={`size-1.5 rounded-full transition ${i === activeIdx ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }}
            className="absolute top-5 right-5 size-9 rounded-full bg-white/15 hover:bg-white/25 text-white grid place-items-center"
            aria-label="닫기"
          >
            <X className="size-5" />
          </button>
          {photos.length > 1 && lightboxIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((idx) => (idx === null ? null : Math.max(0, idx - 1))); }}
              className="absolute left-4 size-10 rounded-full bg-white/15 hover:bg-white/25 text-white grid place-items-center"
              aria-label="이전"
            >
              ‹
            </button>
          )}
          {photos.length > 1 && lightboxIdx < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((idx) => (idx === null ? null : Math.min(photos.length - 1, idx + 1))); }}
              className="absolute right-4 size-10 rounded-full bg-white/15 hover:bg-white/25 text-white grid place-items-center"
              aria-label="다음"
            >
              ›
            </button>
          )}
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[lightboxIdx].photo_url}
              alt={photos[lightboxIdx].caption ?? "공부 인증샷"}
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
            {photos.length > 1 && (
              <p className="mt-3 text-center text-white/70 text-[12px] tabular-nums">
                {lightboxIdx + 1} / {photos.length}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center px-3 pt-2">
        <button onClick={onToggleLike} className="p-2 -ml-1" aria-label="좋아요">
          <Heart
            className={`size-7 transition ${liked ? "fill-red-500 text-red-500 scale-110" : "text-ink"}`}
            strokeWidth={1.8}
          />
        </button>
        <button
          onClick={() => setShowAll((s) => !s)}
          className="p-2"
          aria-label="댓글"
        >
          <MessageCircle className="size-7 text-ink -scale-x-100" strokeWidth={1.8} />
        </button>
        <button className="p-2" aria-label="공유">
          <Send className="size-7 text-ink" strokeWidth={1.8} />
        </button>
        <button onClick={onToggleSave} className="ml-auto p-2 -mr-1" aria-label="저장">
          <Bookmark
            className={`size-7 transition ${isSaved ? "fill-ink text-ink" : "text-ink"}`}
            strokeWidth={1.8}
          />
        </button>
      </div>

      <p className="px-4 text-[13px] font-semibold text-ink">좋아요 {likeCount}개</p>

      {editingCaption ? (
        <div className="px-4 mt-1 flex items-center gap-2">
          <input
            value={captionDraft}
            onChange={(e) => setCaptionDraft(e.target.value.slice(0, 200))}
            placeholder="코멘트 수정…"
            className="flex-1 bg-paper rounded-lg px-2 py-1.5 text-[13px] outline-none ring-1 ring-black/5"
            autoFocus
          />
          <button
            onClick={async () => {
              await onEditCaption(captionDraft);
              setEditingCaption(false);
            }}
            className="text-accent p-1"
            aria-label="저장"
          >
            <Check className="size-4" />
          </button>
          <button onClick={() => setEditingCaption(false)} className="text-ink/50 p-1" aria-label="취소">
            <X className="size-4" />
          </button>
        </div>
      ) : (
        p.caption && (
          <p className="px-4 mt-1 text-[13px] text-ink leading-snug">
            <span className="font-semibold mr-1.5">
              {p.profile?.display_name ?? (isMine ? myProfile?.display_name : null) ?? "공부친구"}
            </span>
            <span className="whitespace-pre-wrap">{p.caption}</span>
          </p>
        )
      )}

      {comments.length > 2 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="px-4 mt-1 text-[12px] text-ink/50"
        >
          댓글 {comments.length}개 모두 보기
        </button>
      )}

      {visible.length > 0 && (
        <ul className="px-4 mt-1 space-y-0.5">
          {visible.map((c) => (
            <CommentItem
              key={c.id}
              c={c}
              canManage={c.user_id === currentUserId || isAdmin}
              onDelete={() => deleteComment(c.id)}
              onEdit={(content) => editComment(c.id, content)}
            />
          ))}
        </ul>
      )}

      <p className="px-4 mt-1.5 text-[10px] tracking-wider uppercase text-ink/45">
        {timeAgo(p.created_at)}
      </p>

      {/* 댓글 입력 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitComment();
        }}
        className="mt-2 px-4 flex items-center gap-2 border-t border-black/[0.04] pt-2"
      >
        <Avatar size={24} ring={false} url={myProfile?.avatar_url} emoji={myProfile?.avatar_emoji} />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 500))}
          placeholder="댓글 달기…"
          className="flex-1 bg-transparent text-[13px] text-ink placeholder:text-ink/40 outline-none py-1.5"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="text-[13px] font-semibold text-accent disabled:text-ink/30"
        >
          {sending ? "..." : "게시"}
        </button>
      </form>
    </article>
  );
}

function CommentItem({
  c,
  canManage,
  onDelete,
  onEdit,
}: {
  c: CommentRow;
  canManage: boolean;
  onDelete: () => void;
  onEdit: (content: string) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(c.content);

  if (editing) {
    return (
      <li className="text-[13px] text-ink leading-snug flex items-center gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 500))}
          className="flex-1 bg-paper rounded-lg px-2 py-1 text-[13px] outline-none ring-1 ring-black/5"
          autoFocus
        />
        <button
          onClick={async () => {
            const next = draft.trim();
            if (!next) return;
            await onEdit(next);
            setEditing(false);
          }}
          className="text-accent text-[11px] font-semibold"
        >
          저장
        </button>
        <button onClick={() => setEditing(false)} className="text-ink/40 text-[11px]">취소</button>
      </li>
    );
  }

  return (
    <li className="text-[13px] text-ink leading-snug flex items-start gap-2 group">
      <Avatar size={20} ring={false} url={c.profile?.avatar_url} emoji={c.profile?.avatar_emoji} />
      <span className="flex-1">
        <span className="font-semibold mr-1.5">
          {c.profile?.full_name ?? c.profile?.display_name ?? "공부친구"}
        </span>
        <span className="whitespace-pre-wrap">{c.content}</span>
        <span className="ml-2 text-[10px] text-ink/40">{timeAgo(c.created_at)}</span>
      </span>
      {canManage && (
        <span className="opacity-0 group-hover:opacity-100 flex items-center gap-2">
          <button onClick={() => { setDraft(c.content); setEditing(true); }} className="text-ink/40 hover:text-ink text-[11px]" aria-label="댓글 수정">수정</button>
          <button onClick={onDelete} className="text-ink/40 hover:text-red-500 text-[11px]" aria-label="댓글 삭제">삭제</button>
        </span>
      )}
    </li>
  );
}
