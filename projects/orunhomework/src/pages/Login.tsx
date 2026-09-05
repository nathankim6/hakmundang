import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import orunLogo from "@/assets/orun-academy-logo.jpg";

export default function Login() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast({
        title: "접속 코드를 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const result = await login(code);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "로그인 성공",
        description: "환영합니다!",
        duration: 1000,
      });
      navigate("/");
    } else {
      toast({
        title: "로그인 실패",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-background">
      {/* Visionary ambient background */}
      <div className="fixed top-[-15%] right-[-5%] w-[50%] h-[50%] bg-primary/[0.07] blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-muted-foreground/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-[460px] animate-fade-in">
        <div className="bg-white/60 backdrop-blur-3xl rounded-[48px] border border-white/80 p-10 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
          {/* Branding */}
          <div className="mb-10 text-center">
            <div className="w-16 h-16 rounded-[18px] mx-auto mb-6 overflow-hidden bg-white shadow-xl shadow-primary/20 ring-1 ring-border">
              <img src={orunLogo} alt="옳은영어 로고" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-orbitron text-3xl font-bold tracking-[0.06em] text-foreground">ORUN HOMEWORK</h1>


          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative flex items-center">
              <Lock className="absolute left-5 w-[18px] h-[18px] text-muted-foreground/70 pointer-events-none" />
              <Input
                type="password"
                placeholder="접속 코드"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-14 pl-14 pr-6 bg-secondary/50 border-2 border-transparent rounded-2xl text-foreground placeholder:text-muted-foreground/70 font-medium tracking-wide focus-visible:border-primary/30 focus-visible:bg-white focus-visible:ring-0 transition-all"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl text-base font-bold shadow-[0_12px_24px_-6px_hsl(var(--primary)/0.35)] hover:scale-[1.01] active:scale-[0.98] transition-all group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  확인 중...
                </>
              ) : (
                <>
                  로그인
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-border/60 text-center">
            <p className="text-muted-foreground text-sm">
              접속 코드가 없으신가요? 관리자에게 문의하세요.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-widest">
            Admin &amp; Student Integrated Portal
          </p>
        </div>
      </div>
    </div>
  );
}

