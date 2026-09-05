import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/lib/admin";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";
import { Trash2, Plus, Calendar, Users as UsersIcon, Pencil, Check, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "관리 — 옳품타" },
      { name: "description", content: "관리자 전용: 회원과 시즌을 관리합니다." },
    ],
  }),
});

type Tab = "members" | "seasons";

function AdminPage() {
  const admin = useIsAdmin();
  const [tab, setTab] = useState<Tab>("members");
  if (!admin) {
    return (
      <div className="min-h-dvh bg-paper grid place-items-center px-4">
        <div className="w-full max-w-sm bg-sheet rounded-[28px] ring-1 ring-black/5 p-6 text-center">
          <div className="text-3xl mb-2">🔒</div>
          <h1 className="text-lg font-display font-semibold mb-1">관리자 전용</h1>
          <p className="text-xs text-ink/50 mb-4">관리 페이지는 관리자 계정으로만 접근할 수 있어요.</p>
          <Link to="/" className="inline-block bg-accent text-white rounded-2xl px-5 py-3 font-semibold text-sm">홈으로</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink pb-32">
      <header className="max-w-md mx-auto pt-10 px-6">
        <h1 className="text-2xl font-semibold font-display">관리</h1>
        <p className="text-sm text-ink/60">회원과 시즌을 관리해요</p>
      </header>

      <div className="max-w-md mx-auto px-6 mt-5 grid grid-cols-2 gap-2">
        <button
          onClick={() => setTab("members")}
          className={`rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition ${
            tab === "members" ? "bg-ink text-white" : "bg-sheet ring-1 ring-black/5 text-ink/70"
          }`}
        >
          <UsersIcon className="size-4" /> 회원관리
        </button>
        <button
          onClick={() => setTab("seasons")}
          className={`rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition ${
            tab === "seasons" ? "bg-ink text-white" : "bg-sheet ring-1 ring-black/5 text-ink/70"
          }`}
        >
          <Calendar className="size-4" /> 시즌 설정
        </button>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5">
        {tab === "members" ? <MembersPanel /> : <SeasonsPanel />}
      </div>

      <BottomNav />
    </div>
  );
}

type Profile = {
  id: string;
  display_name: string;
  avatar_emoji: string;
  full_name: string | null;
  school: string | null;
  grade: string | null;
  campus: string | null;
  class_name: string | null;
  created_at: string;
};

function MembersPanel() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["admin_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_emoji, full_name, school, grade, campus, class_name, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });

  const filtered = members.filter((m) => {
    if (!q.trim()) return true;
    const s = q.trim().toLowerCase();
    return [m.display_name, m.full_name, m.school, m.campus, m.class_name]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(s));
  });

  async function handleDelete(p: Profile) {
    if (!confirm(`'${p.display_name}' 회원의 프로필을 삭제할까요?\n(공부 기록, 사진, 댓글 등 관련 데이터가 함께 정리됩니다.)`)) return;
    try {
      // Manual cleanup since FKs may not cascade
      await supabase.from("study_sessions").delete().eq("user_id", p.id);
      await supabase.from("photo_comments").delete().eq("user_id", p.id);
      await supabase.from("photo_likes").delete().eq("user_id", p.id);
      await supabase.from("study_photos").delete().eq("user_id", p.id);
      await supabase.from("friendships").delete().eq("user_id", p.id);
      await supabase.from("friendships").delete().eq("friend_id", p.id);
      await supabase.from("goals").delete().eq("user_id", p.id);
      await supabase.from("subjects").delete().eq("user_id", p.id);
      const { error } = await supabase.from("profiles").delete().eq("id", p.id);
      if (error) throw error;
      toast.success("회원을 삭제했어요");
      qc.invalidateQueries({ queryKey: ["admin_members"] });
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "삭제에 실패했어요";
      toast.error(msg);
    }
  }

  return (
    <section className="bg-sheet rounded-[24px] ring-1 ring-black/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="이름·학교·반 검색"
          className="flex-1 bg-paper rounded-xl px-3 py-2 text-sm outline-none ring-1 ring-black/5 focus:ring-accent"
        />
        <span className="text-[11px] text-ink/50">{filtered.length}명</span>
      </div>
      {isLoading ? (
        <p className="text-sm text-ink/40 text-center py-8">불러오는 중…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink/40 text-center py-8">회원이 없어요</p>
      ) : (
        <ul className="divide-y divide-black/[0.06]">
          {filtered.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-2.5">
              <div className="size-9 rounded-full bg-page grid place-items-center text-base">
                {m.avatar_emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate">
                  {m.display_name}
                  {m.full_name && m.full_name !== m.display_name && (
                    <span className="ml-1 text-ink/40 font-normal">({m.full_name})</span>
                  )}
                </p>
                <p className="text-[11px] text-ink/50 truncate">
                  {[m.class_name, m.school, m.campus].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <button
                onClick={() => handleDelete(m)}
                className="size-9 grid place-items-center rounded-full text-ink/50 hover:text-red-500 hover:bg-red-50 transition"
                aria-label="회원 삭제"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type Period = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  sort_order: number;
};

function SeasonsPanel() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ name: string; start_date: string; end_date: string; sort_order: number }>({
    name: "",
    start_date: "",
    end_date: "",
    sort_order: 0,
  });
  const [creating, setCreating] = useState(false);
  const [newDraft, setNewDraft] = useState<{ name: string; start_date: string; end_date: string; sort_order: number }>({
    name: "",
    start_date: "",
    end_date: "",
    sort_order: 0,
  });

  const { data: periods = [], isLoading } = useQuery({
    queryKey: ["admin_periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exam_periods")
        .select("id, name, start_date, end_date, sort_order")
        .order("sort_order", { ascending: true })
        .order("start_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Period[];
    },
  });

  function startEdit(p: Period) {
    setEditingId(p.id);
    setEditDraft({ name: p.name, start_date: p.start_date, end_date: p.end_date, sort_order: p.sort_order });
  }

  async function saveEdit(id: string) {
    if (!editDraft.name.trim() || !editDraft.start_date || !editDraft.end_date) {
      toast.error("이름, 시작일, 종료일을 입력해주세요");
      return;
    }
    const { error } = await supabase
      .from("exam_periods")
      .update({
        name: editDraft.name.trim(),
        start_date: editDraft.start_date,
        end_date: editDraft.end_date,
        sort_order: editDraft.sort_order,
      })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("저장했어요");
    setEditingId(null);
    qc.invalidateQueries({ queryKey: ["admin_periods"] });
    qc.invalidateQueries({ queryKey: ["currentExamPeriod"] });
  }

  async function handleDelete(p: Period) {
    if (!confirm(`'${p.name}' 시즌을 삭제할까요?`)) return;
    const { error } = await supabase.from("exam_periods").delete().eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("삭제했어요");
    qc.invalidateQueries({ queryKey: ["admin_periods"] });
    qc.invalidateQueries({ queryKey: ["currentExamPeriod"] });
  }

  async function createNew() {
    if (!newDraft.name.trim() || !newDraft.start_date || !newDraft.end_date) {
      toast.error("이름, 시작일, 종료일을 입력해주세요");
      return;
    }
    const { error } = await supabase.from("exam_periods").insert({
      name: newDraft.name.trim(),
      start_date: newDraft.start_date,
      end_date: newDraft.end_date,
      sort_order: newDraft.sort_order,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("시즌을 추가했어요");
    setCreating(false);
    setNewDraft({ name: "", start_date: "", end_date: "", sort_order: 0 });
    qc.invalidateQueries({ queryKey: ["admin_periods"] });
    qc.invalidateQueries({ queryKey: ["currentExamPeriod"] });
  }

  return (
    <section className="bg-sheet rounded-[24px] ring-1 ring-black/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] text-ink/60">시즌(시험기간) 시작·종료를 설정해요</p>
        <button
          onClick={() => setCreating((v) => !v)}
          className="size-8 grid place-items-center rounded-full bg-ink text-white hover:opacity-90"
          aria-label="새 시즌"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {creating && (
        <div className="bg-paper rounded-2xl ring-1 ring-black/5 p-3 mb-3 space-y-2">
          <input
            value={newDraft.name}
            onChange={(e) => setNewDraft({ ...newDraft, name: e.target.value })}
            placeholder="시즌 이름 (예: 1학기 중간고사)"
            className="w-full bg-sheet rounded-lg px-3 py-2 text-sm outline-none ring-1 ring-black/5"
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[11px] text-ink/60">
              시작일
              <input
                type="date"
                value={newDraft.start_date}
                onChange={(e) => setNewDraft({ ...newDraft, start_date: e.target.value })}
                className="w-full mt-1 bg-sheet rounded-lg px-2 py-2 text-sm outline-none ring-1 ring-black/5"
              />
            </label>
            <label className="text-[11px] text-ink/60">
              종료일
              <input
                type="date"
                value={newDraft.end_date}
                onChange={(e) => setNewDraft({ ...newDraft, end_date: e.target.value })}
                className="w-full mt-1 bg-sheet rounded-lg px-2 py-2 text-sm outline-none ring-1 ring-black/5"
              />
            </label>
          </div>
          <label className="text-[11px] text-ink/60 block">
            정렬 순서
            <input
              type="number"
              value={newDraft.sort_order}
              onChange={(e) => setNewDraft({ ...newDraft, sort_order: Number(e.target.value) })}
              className="w-full mt-1 bg-sheet rounded-lg px-2 py-2 text-sm outline-none ring-1 ring-black/5"
            />
          </label>
          <div className="flex gap-2 pt-1">
            <button onClick={createNew} className="flex-1 bg-accent text-white rounded-xl py-2 text-sm font-semibold">
              추가
            </button>
            <button onClick={() => setCreating(false)} className="px-4 bg-black/[0.05] rounded-xl py-2 text-sm">
              취소
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-ink/40 text-center py-8">불러오는 중…</p>
      ) : periods.length === 0 ? (
        <p className="text-sm text-ink/40 text-center py-8">등록된 시즌이 없어요</p>
      ) : (
        <ul className="space-y-2">
          {periods.map((p) => {
            const editing = editingId === p.id;
            return (
              <li key={p.id} className="bg-paper rounded-2xl ring-1 ring-black/5 p-3">
                {editing ? (
                  <div className="space-y-2">
                    <input
                      value={editDraft.name}
                      onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                      className="w-full bg-sheet rounded-lg px-3 py-2 text-sm outline-none ring-1 ring-black/5"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={editDraft.start_date}
                        onChange={(e) => setEditDraft({ ...editDraft, start_date: e.target.value })}
                        className="bg-sheet rounded-lg px-2 py-2 text-sm outline-none ring-1 ring-black/5"
                      />
                      <input
                        type="date"
                        value={editDraft.end_date}
                        onChange={(e) => setEditDraft({ ...editDraft, end_date: e.target.value })}
                        className="bg-sheet rounded-lg px-2 py-2 text-sm outline-none ring-1 ring-black/5"
                      />
                    </div>
                    <label className="text-[11px] text-ink/60 block">
                      정렬 순서
                      <input
                        type="number"
                        value={editDraft.sort_order}
                        onChange={(e) => setEditDraft({ ...editDraft, sort_order: Number(e.target.value) })}
                        className="w-full mt-1 bg-sheet rounded-lg px-2 py-2 text-sm outline-none ring-1 ring-black/5"
                      />
                    </label>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(p.id)} className="flex-1 bg-accent text-white rounded-xl py-2 text-sm font-semibold flex items-center justify-center gap-1">
                        <Check className="size-4" /> 저장
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-4 bg-black/[0.05] rounded-xl py-2 text-sm flex items-center gap-1">
                        <X className="size-4" /> 취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold truncate">{p.name}</p>
                      <p className="text-[12px] text-ink/60">
                        {p.start_date} → {p.end_date}
                      </p>
                    </div>
                    <button onClick={() => startEdit(p)} className="size-8 grid place-items-center rounded-full text-ink/60 hover:bg-black/[0.05]" aria-label="수정">
                      <Pencil className="size-4" />
                    </button>
                    <button onClick={() => handleDelete(p)} className="size-8 grid place-items-center rounded-full text-ink/50 hover:text-red-500 hover:bg-red-50" aria-label="삭제">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
