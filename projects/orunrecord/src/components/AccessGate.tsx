import { useEffect, useState, type FormEvent } from "react";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import orunLogo from "@/assets/orun-logo.png";

const ACCESS_CODE = "0088";
const STORAGE_KEY = "orun-access-granted";

interface AccessGateProps {
  children: React.ReactNode;
}

export function AccessGate({ children }: AccessGateProps) {
  const [granted, setGranted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!granted) {
      // 인풋에 자동 포커스
      const t = setTimeout(() => {
        document.getElementById("access-code-input")?.focus();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [granted]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (code.trim() === ACCESS_CODE) {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore
      }
      setGranted(true);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  if (granted) return <>{children}</>;

  return (
    <div className="min-h-screen gradient-hero text-primary-foreground flex items-center justify-center p-5 relative overflow-hidden">
      {/* Ambient color orbs */}
      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 22%, hsl(38 90% 55% / 0.45), transparent 55%), radial-gradient(circle at 82% 78%, hsl(224 90% 55% / 0.5), transparent 55%), radial-gradient(circle at 60% 0%, hsl(280 70% 55% / 0.25), transparent 60%)",
        }}
      />
      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div
        className={cn(
          "relative w-full max-w-md rounded-3xl bg-white/8 backdrop-blur-xl border border-white/15 shadow-elevated p-8 sm:p-10 animate-fade-in",
          shake && "animate-[shake_0.4s_ease-in-out]",
        )}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/95 shadow-elegant flex items-center justify-center p-2 ring-1 ring-white/40">
            <img src={orunLogo} alt="Orun Academy" className="w-full h-full object-contain" />
          </div>
        </div>




        <h1 className="font-display text-center text-3xl font-bold tracking-tight mb-2">
          액세스 코드 입력
        </h1>
        <p className="text-center text-sm text-primary-foreground/65 mb-7 leading-relaxed">
          이 페이지는 비공개입니다.
          <br />
          액세스 코드를 입력해 주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              id="access-code-input"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError(false);
              }}
              placeholder="••••"
              className={cn(
                "h-14 text-center font-numeric text-2xl tracking-[0.5em] bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/30 focus-visible:ring-accent",
                error && "border-destructive/70 ring-2 ring-destructive/40",
              )}
              maxLength={16}
            />
            {error && (
              <p className="mt-2 text-xs text-center text-destructive-foreground bg-destructive/40 border border-destructive/50 rounded-lg py-1.5 px-2">
                잘못된 액세스 코드입니다
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-accent text-accent-foreground font-semibold shadow-elegant hover:shadow-glow transition-smooth border-0 hover:bg-accent/90"
          >
            접속하기
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="mt-7 pt-5 border-t border-white/10 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-primary-foreground/40">
            ORUN ENGLISH · 옳은영어
          </p>
        </div>
      </div>
    </div>
  );
}
