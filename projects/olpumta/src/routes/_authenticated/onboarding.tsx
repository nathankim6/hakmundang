import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
  head: () => ({
    meta: [
      { title: "정보 입력 — 옳품타" },
      { name: "description", content: "옳품타에서 사용할 소속·반·이름을 입력해주세요." },
    ],
  }),
});

const CAMPUSES = ["뉴베리타스관", "흑석관"];
const GRADES = ["1학년", "2학년", "3학년", "4학년", "5학년", "6학년", "중1", "중2", "중3", "고1", "고2", "고3"];
const CLASSES = ["IVY", "1FO", "1IN", "1AD", "2FO", "2IN", "2AD", "3FO", "3IN", "3AD", "TOP", "고등부"];

function OnboardingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [school, setSchool] = useState("");
  const [campus, setCampus] = useState("");
  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, school, campus, grade, class_name").eq("id", user.id).single().then(({ data }) => {
      const d = data as { full_name?: string | null; school?: string | null; campus?: string | null; grade?: string | null; class_name?: string | null } | null;
      if (d?.full_name) setFullName(d.full_name);
      if (d?.school) setSchool(d.school);
      if (d?.campus) setCampus(d.campus);
      if (d?.grade) setGrade(d.grade);
      if (d?.class_name) setClassName(d.class_name);
    });
  }, [user]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!fullName.trim() || !school.trim() || !campus || !grade || !className) {
      toast.error("이름, 학교, 소속, 학년, 반을 모두 입력해주세요");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), school: school.trim(), campus, grade, class_name: className, display_name: fullName.trim() })
      .eq("id", user.id);
    if (error) {
      toast.error(error.message);
      setBusy(false);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["profile-character", user.id] });
    await qc.invalidateQueries({ queryKey: ["profile", user.id] });
    toast.success("저장되었어요");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm bg-sheet rounded-[32px] ring-1 ring-black/5 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">📝</div>
          <h1 className="font-display text-2xl font-bold text-ink dark:text-white">옳품타 가입 정보</h1>
          <p className="text-xs text-ink/60 dark:text-white/70 mt-1">소속, 반, 이름을 입력해주세요</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="text"
            placeholder="이름"
            value={fullName}
            required
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-11 px-4 rounded-2xl bg-paper ring-1 ring-black/10 text-sm focus:outline-none focus:ring-accent"
          />
          <input
            type="text"
            placeholder="학교 (예: 흑석고)"
            value={school}
            required
            onChange={(e) => setSchool(e.target.value)}
            className="w-full h-11 px-4 rounded-2xl bg-paper ring-1 ring-black/10 text-sm focus:outline-none focus:ring-accent"
          />
          <select
            value={campus}
            required
            onChange={(e) => setCampus(e.target.value)}
            className="w-full h-11 px-3 rounded-2xl bg-paper ring-1 ring-black/10 text-sm focus:outline-none focus:ring-accent"
          >
            <option value="" disabled>소속 선택</option>
            {CAMPUSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={grade}
            required
            onChange={(e) => setGrade(e.target.value)}
            className="w-full h-11 px-3 rounded-2xl bg-paper ring-1 ring-black/10 text-sm focus:outline-none focus:ring-accent"
          >
            <option value="" disabled>학년 선택</option>
            {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            value={className}
            required
            onChange={(e) => setClassName(e.target.value)}
            className="w-full h-11 px-3 rounded-2xl bg-paper ring-1 ring-black/10 text-sm focus:outline-none focus:ring-accent"
          >
            <option value="" disabled>반 선택</option>
            {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            type="submit"
            disabled={busy}
            className="w-full h-11 rounded-full bg-accent text-sheet font-semibold text-sm hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "저장 중..." : "저장하고 시작하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
