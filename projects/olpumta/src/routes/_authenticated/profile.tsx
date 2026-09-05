import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ChevronRight, Camera, X } from "lucide-react";
import { CHARACTERS, CharacterType, characterImage, nextStageProgress } from "@/lib/character";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
  head: () => ({
    meta: [
      { title: "내 프로필 — 옳품타" },
      { name: "description", content: "옳품타 프로필에서 내 캐릭터·정보·과목을 관리해요." },
    ],
  }),
});

const EMOJIS = ["🐻", "🐰", "🐱", "🐶", "🦊", "🐼", "🐨", "🐯", "🦁", "🐸"];
const CAMPUSES = ["뉴베리타스관", "흑석관"];
const GRADES = ["1학년", "2학년", "3학년", "4학년", "5학년", "6학년", "중1", "중2", "중3", "고1", "고2", "고3"];
const CLASSES = ["IVY", "1FO", "1IN", "1AD", "2FO", "2IN", "2AD", "3FO", "3IN", "3AD", "TOP", "고등부"];
const SUBJECT_COLORS = ["pink", "blue", "green", "yellow"] as const;
const STICKER_BG: Record<string, string> = {
  pink: "bg-sticker-pink",
  blue: "bg-sticker-blue",
  green: "bg-sticker-green",
  yellow: "bg-sticker-yellow",
};

type Subject = { id: string; name: string; color: string };

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [fullName, setFullName] = useState("");
  const [emoji, setEmoji] = useState("🐻");
  const [campus, setCampus] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newColor, setNewColor] = useState("pink");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: profile, refetch } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: subjects, refetch: refetchSubjects } = useQuery({
    queryKey: ["subjects", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Subject[]> => {
      const { data, error } = await supabase.from("subjects").select("id,name,color").eq("user_id", user!.id).order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: character } = useQuery({
    queryKey: ["character", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: prof } = await supabase.from("profiles").select("character_type").eq("id", user!.id).single();
      const { data: sess } = await supabase.from("study_sessions").select("duration_seconds").eq("user_id", user!.id);
      const totalSec = (sess ?? []).reduce((a, r) => a + r.duration_seconds, 0);
      return { type: prof?.character_type as CharacterType | null, exp: Math.floor(totalSec / 60) };
    },
  });

  useEffect(() => {
    if (profile) {
      setName(profile.display_name);
      setEmoji(profile.avatar_emoji);
      setFullName(profile.full_name ?? "");
      setCampus(profile.campus ?? "");
      setSchool((profile as { school?: string | null }).school ?? "");
      setGrade((profile as { grade?: string | null }).grade ?? "");
      setClassName(profile.class_name ?? "");
      setAvatarUrl((profile as { avatar_url?: string | null }).avatar_url ?? null);
    }
  }, [profile]);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("5MB 이하 이미지만 가능"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = pub.publicUrl;
      const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      if (dbErr) throw dbErr;
      setAvatarUrl(url);
      toast.success("사진을 올렸어요");
      refetch();
      qc.invalidateQueries({ queryKey: ["profile-character", user.id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
    if (error) { toast.error(error.message); return; }
    setAvatarUrl(null);
    toast.success("사진을 삭제했어요");
    refetch();
  };

  const save = async () => {
    if (!name.trim()) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: name.trim(),
        avatar_emoji: emoji,
        full_name: fullName.trim() || null,
        campus: campus || null,
        school: school.trim() || null,
        grade: grade || null,
        class_name: className || null,
      })
      .eq("id", user!.id);
    if (error) toast.error(error.message);
    else {
      toast.success("저장 완료!");
      refetch();
      qc.invalidateQueries({ queryKey: ["profile-character", user!.id] });
      qc.invalidateQueries({ queryKey: ["character", user!.id] });
    }
  };

  const addSubject = async () => {
    const n = newSubject.trim();
    if (!n) return;
    if ((subjects ?? []).some((s) => s.name === n)) {
      toast.error("이미 있는 과목이에요");
      return;
    }
    const { error } = await supabase.from("subjects").insert({ user_id: user!.id, name: n, color: newColor });
    if (error) toast.error(error.message);
    else {
      setNewSubject("");
      refetchSubjects();
      qc.invalidateQueries({ queryKey: ["subjects"] });
    }
  };

  const removeSubject = async (id: string) => {
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      refetchSubjects();
      qc.invalidateQueries({ queryKey: ["subjects"] });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const c = character?.type ? CHARACTERS[character.type] : null;
  const prog = character ? nextStageProgress(character.exp) : null;

  return (
    <div className="min-h-screen bg-paper text-ink pb-32">
      <header className="max-w-md mx-auto pt-10 px-6">
        <h1 className="text-2xl font-semibold font-display">내 프로필</h1>
        <p className="text-sm text-ink/60">{user?.email}</p>
      </header>

      <main className="max-w-md mx-auto px-6 mt-6 space-y-6">
        {/* 등대 건축 카드 */}
        <Link
          to="/growth"
          className="block p-5 bg-sheet rounded-[28px] ring-1 ring-black/5 hover:ring-accent/30 transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-accent/60" />
          <div className="flex items-center gap-4">
            <div className={`relative size-16 rounded-2xl grid place-items-center shrink-0 overflow-hidden ${c?.bg ?? "bg-sticker-blue/30"}`}>
              <img src={characterImage("lighthouse", character?.exp ?? 0)} alt="옳은 Lighthouse" className="mon-anim size-14 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold font-display">{c ? `${c.name} · ${prog?.label}` : "옳은 Lighthouse · 기초공사"}</p>
              <p className="text-[11px] text-ink/50 mt-0.5">
                {c ? `${character?.exp.toLocaleString()} EXP · ${prog?.percent}%` : "공부 시간을 모아 나만의 등대를 세워보세요"}
              </p>
              {prog && prog.percent < 100 && (
                <div className="h-1.5 w-full bg-paper rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-accent" style={{ width: `${prog.percent}%` }} />

                </div>
              )}
            </div>
            <ChevronRight className="size-5 text-ink/40 shrink-0" />
          </div>
        </Link>

        {/* 정보 수정 */}
        <section className="bg-sheet rounded-[24px] ring-1 ring-black/5 p-5 space-y-4">
          <h2 className="text-sm font-semibold font-display">정보 수정</h2>
          <div className="flex flex-col items-center">
            <div className="relative">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="size-24 rounded-full bg-paper ring-1 ring-black/10 overflow-hidden grid place-items-center hover:ring-accent transition disabled:opacity-60"
                aria-label="프로필 사진 업로드"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="프로필 사진" className="size-full object-cover" />
                ) : (
                  <span className="text-5xl">{emoji}</span>
                )}
              </button>
              <span className="absolute -bottom-1 -right-1 size-8 rounded-full bg-accent text-sheet grid place-items-center ring-2 ring-sheet shadow">
                <Camera className="size-4" />
              </span>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-1 -right-1 size-7 rounded-full bg-white text-ink/70 grid place-items-center ring-1 ring-black/10 shadow"
                  aria-label="사진 삭제"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickFile}
            />
            <p className="text-[11px] text-ink/50 mt-2">
              {uploading ? "올리는 중…" : avatarUrl ? "사진을 눌러 변경" : "사진을 올리거나 아래 이모지 선택"}
            </p>
          </div>
          {!avatarUrl && (
            <div className="grid grid-cols-5 gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={
                    "aspect-square rounded-2xl text-2xl ring-1 transition-colors " +
                    (emoji === e ? "bg-accent/10 ring-accent" : "bg-paper ring-black/10")
                  }
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          <div>
            <label className="text-xs text-ink/60 font-medium">이름</label>
            <input
              type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full h-11 px-4 rounded-2xl bg-paper ring-1 ring-black/10 text-sm focus:outline-none focus:ring-accent"
            />
          </div>
          <div>
            <label className="text-xs text-ink/60 font-medium">닉네임 (검색용)</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full h-11 px-4 rounded-2xl bg-paper ring-1 ring-black/10 text-sm focus:outline-none focus:ring-accent"
            />
          </div>
          <div>
            <label className="text-xs text-ink/60 font-medium">학교</label>
            <input
              type="text" value={school} onChange={(e) => setSchool(e.target.value)}
              placeholder="예: 흑석고"
              className="mt-1 w-full h-11 px-4 rounded-2xl bg-paper ring-1 ring-black/10 text-sm focus:outline-none focus:ring-accent"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-ink/60 font-medium">소속</label>
              <select
                value={campus} onChange={(e) => setCampus(e.target.value)}
                className="mt-1 w-full h-11 px-3 rounded-2xl bg-paper ring-1 ring-black/10 text-sm focus:outline-none focus:ring-accent"
              >
                <option value="">선택</option>
                {CAMPUSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-ink/60 font-medium">학년</label>
              <select
                value={grade} onChange={(e) => setGrade(e.target.value)}
                className="mt-1 w-full h-11 px-3 rounded-2xl bg-paper ring-1 ring-black/10 text-sm focus:outline-none focus:ring-accent"
              >
                <option value="">선택</option>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-ink/60 font-medium">반</label>
              <select
                value={className} onChange={(e) => setClassName(e.target.value)}
                className="mt-1 w-full h-11 px-3 rounded-2xl bg-paper ring-1 ring-black/10 text-sm focus:outline-none focus:ring-accent"
              >
                <option value="">선택</option>
                {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button onClick={save} className="w-full h-11 rounded-full bg-accent text-sheet text-sm font-semibold">
            저장
          </button>
        </section>

        {/* 과목 관리 */}
        <section className="bg-sheet rounded-[24px] ring-1 ring-black/5 p-5 space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold font-display">내 과목</h2>
            <span className="text-[10px] text-ink/40">{(subjects ?? []).length}개</span>
          </div>
          <div className="space-y-2">
            {(subjects ?? []).map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-2xl bg-paper ring-1 ring-black/5">
                <span className={`size-3 rounded-full ${STICKER_BG[s.color] ?? "bg-sticker-pink"}`} />
                <span className="flex-1 text-sm font-medium truncate">{s.name}</span>
                <button
                  onClick={() => removeSubject(s.id)}
                  className="text-ink/30 hover:text-destructive p-1"
                  aria-label="삭제"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            {(subjects ?? []).length === 0 && (
              <p className="text-xs text-ink/40 text-center py-4">과목을 추가해보세요</p>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-950/5 space-y-2">
            <input
              type="text"
              placeholder="새 과목 이름 (예: 국어, 과학, 사회…)"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubject()}
              className="w-full h-11 px-4 rounded-2xl bg-paper ring-1 ring-black/10 text-sm focus:outline-none focus:ring-accent"
            />
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 flex-1">
                {SUBJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    aria-label={c}
                    className={
                      `size-7 rounded-full ${STICKER_BG[c]} ring-2 transition-all ` +
                      (newColor === c ? "ring-accent scale-110" : "ring-transparent")
                    }
                  />
                ))}
              </div>
              <button
                onClick={addSubject}
                className="h-9 px-3 rounded-full bg-accent text-sheet text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="size-3.5" /> 추가
              </button>
            </div>
          </div>
        </section>

        <button onClick={logout} className="w-full h-11 rounded-full bg-sheet ring-1 ring-black/10 text-ink/70 text-sm font-medium">
          로그아웃
        </button>

        <p className="text-center text-xs text-ink/40">
          모바일 브라우저에서 메뉴 → "홈 화면에 추가"하면 앱처럼 사용할 수 있어요
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
