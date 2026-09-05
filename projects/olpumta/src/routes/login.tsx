import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import orunLogo from "@/assets/orun-logo.png";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "로그인 — 옳품타" },
      { name: "description", content: "공부 기록과 친구 랭킹을 시작하세요." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("환영합니다 🐻");
      navigate({ to: "/" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "로그인에 실패했어요";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (r.error) throw r.error instanceof Error ? r.error : new Error(String(r.error));
      if (r.redirected) return;
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google 로그인에 실패했어요");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 py-10">
      <Link to="/" className="text-xs text-ink/50 mb-6">← 둘러보기로 돌아가기</Link>
      <div className="w-full max-w-sm bg-sheet rounded-[32px] ring-1 ring-black/5 p-8 shadow-sm">
        <div className="text-center mb-6">
          <img src={orunLogo} alt="ORUN ACADEMY" className="size-20 mx-auto mb-2 object-contain" />
          <h1
            className="font-display text-3xl font-bold tracking-tight text-ink drop-shadow-[0_1px_0_rgba(255,255,255,0.6)] dark:text-white dark:drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]"
          >
            옳품타
          </h1>
          <p className="text-xs text-ink/60 dark:text-white/70 mt-1">
            {mode === "signin" ? "Only for 옳은영어, 열정품은 타이머, 옳품타" : "Google 계정으로 가입하고 시작해요"}
          </p>
        </div>

        <button
          onClick={google}
          disabled={busy}
          className="w-full mb-4 h-11 rounded-full bg-paper ring-1 ring-black/10 text-ink font-semibold text-sm flex items-center justify-center gap-2 hover:bg-secondary transition-colors disabled:opacity-50"
        >
          <svg className="size-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          {mode === "signup" ? "Google로 가입하기" : "Google로 계속하기"}
        </button>

        {mode === "signin" && (
          <>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-black/10" />
              <span className="text-[10px] text-ink/40 font-semibold">또는</span>
              <div className="flex-1 h-px bg-black/10" />
            </div>

            <form onSubmit={submit} className="space-y-3">
              <input
                type="email"
                placeholder="이메일"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-2xl bg-paper ring-1 ring-black/10 text-sm focus:outline-none focus:ring-accent"
              />
              <input
                type="password"
                placeholder="비밀번호 (6자 이상)"
                value={password}
                required
                minLength={6}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 rounded-2xl bg-paper ring-1 ring-black/10 text-sm focus:outline-none focus:ring-accent"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full h-11 rounded-full bg-accent text-sheet font-semibold text-sm hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "처리중..." : "로그인"}
              </button>
            </form>
          </>
        )}

        {mode === "signup" && (
          <p className="text-[11px] text-ink/50 dark:text-white/60 text-center mt-2 leading-relaxed">
            회원가입은 Google 계정으로만 가능해요.<br />
            가입 후 소속·반·이름을 입력하게 됩니다.
          </p>
        )}

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full mt-4 text-xs text-ink/60 hover:text-accent"
        >
          {mode === "signin" ? "처음이신가요? Google로 가입하기" : "이미 계정이 있어요"}
        </button>
      </div>
    </div>
  );
}
