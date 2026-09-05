import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import orunLogo from "@/assets/pcube-academy-logo.png";

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
        variant: "destructive"
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
        duration: 1000
      });
      navigate("/");
    } else {
      toast({
        title: "로그인 실패",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-600/10 rounded-full blur-3xl" />
      
      {/* Glassmorphism card */}
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Subtle top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          
          <div className="px-8 py-12 md:px-12 md:py-14">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-xl bg-white p-1 shadow-xl ring-4 ring-white/20">
                <img
                  src={orunLogo}
                  alt="Pcube Academy"
                  className="w-full h-full rounded-xl object-cover" />

              </div>
            </div>
            
            {/* Title */}
            <div className="text-center mb-10">
              <h1
                className="text-3xl md:text-4xl font-light uppercase mb-4 bg-gradient-to-r from-amber-200 via-white to-amber-200 bg-clip-text text-transparent drop-shadow-sm"
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontWeight: 300,
                  letterSpacing: '0.15em',
                  textShadow: '0 0 40px rgba(255,255,255,0.1)'
                }}>

                PCUBE ENGLISH 
              </h1>
              <p
                className="text-amber-100/50 text-sm tracking-[0.1em]"
                style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>

                 피큐브 학습관리 애플리케이션
              </p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/5 rounded-2xl blur-sm group-focus-within:bg-white/10 transition-all duration-300" />
                <div className="relative flex items-center">
                  <Lock className="absolute left-5 w-5 h-5 text-white/40" />
                  <Input
                    type="password"
                    placeholder="Access Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-14 pl-14 pr-5 bg-white/10 border-white/20 rounded-2xl text-white placeholder:text-white/40 text-lg tracking-[0.15em] focus:border-white/40 focus:ring-white/20 transition-all duration-300"
                    disabled={isLoading}
                    autoFocus />

                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full h-14 bg-white/20 hover:bg-white/30 border border-white/30 rounded-2xl text-white text-lg font-light tracking-[0.2em] uppercase transition-all duration-300 group"
                style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}
                disabled={isLoading}>

                {isLoading ?
                <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    확인 중...
                  </> :

                <>
                    ENTER
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                }
              </Button>
            </form>
            
            {/* Footer text */}
            <div className="mt-10 text-center">
              <p className="text-white/40 text-xs tracking-wide">
                접속 코드가 없으신가요? 관리자에게 문의하세요.
              </p>
            </div>
          </div>
          
          {/* Subtle bottom gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
    </div>);

}