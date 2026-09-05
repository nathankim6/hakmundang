
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, LockKeyhole, Loader2 } from 'lucide-react';
import orunLogo from '@/assets/orun-dialog-logo.jpg';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AccessCodeFormProps {
  onSuccess: () => void;
}

const AccessCodeForm = ({ onSuccess }: AccessCodeFormProps) => {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-access-code', {
        body: { code: accessCode },
      });

      if (error) throw error;

      if (data?.valid) {
        sessionStorage.setItem('verifiedAccessCode', accessCode);
        localStorage.setItem('accessScope', data.scope || 'full');
        localStorage.setItem('accessAcademy', data.academy || 'orun');
        onSuccess();
        toast({
          title: "접근 권한 획득",
          description: "시험 결과를 확인할 수 있습니다.",
          variant: "default"
        });
      } else {
        toast({
          title: "잘못된 액세스 코드",
          description: data?.reason === 'expired' ? "만료된 액세스 코드입니다." : "올바른 액세스 코드를 입력해주세요.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Access code verification error:', error);
      toast({
        title: "오류 발생",
        description: "액세스 코드 확인 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 flex items-center justify-center p-4">
      {/* Ambient light */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 w-[520px] h-[520px] rounded-full bg-amber-400/10 blur-[140px]" />
        <div className="absolute -bottom-40 -right-24 w-[560px] h-[560px] rounded-full bg-sky-500/10 blur-[150px]" />
        <div className="absolute top-1/2 left-0 w-[420px] h-[420px] rounded-full bg-slate-400/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="group inline-flex items-center gap-1.5 mb-6 text-[11px] font-medium tracking-[0.14em] uppercase text-slate-500 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          돌아가기
        </button>

        {/* Frosted card */}
        <div className="relative rounded-[28px] bg-white/[0.06] border border-white/10 backdrop-blur-2xl shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/5" />

          <div className="relative px-9 pt-11 pb-9">
            {/* Logo */}
            <div className="flex justify-center mb-7">
              <img
                src={orunLogo}
                alt="ORUN ACADEMY 로고"
                className="h-[86px] w-[86px] rounded-full object-cover shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] ring-1 ring-white/20"
              />
            </div>

            {/* Title */}
            <div className="text-center">
              <h1 className="text-[22px] font-light uppercase tracking-[0.32em] text-white/95 leading-tight pl-[0.32em]">
                시험결과 확인
              </h1>
              <p className="mt-2.5 text-[13px] text-slate-400">
                관리자 코드를 입력하세요
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 mt-9">
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400/80" strokeWidth={1.6} />
                <Input
                  type="password"
                  placeholder="Access Code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  className="h-14 pl-11 pr-4 rounded-2xl bg-white/[0.07] border-white/15 text-white placeholder:text-slate-400/70 placeholder:tracking-normal focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:border-white/30 tracking-[0.25em] text-base"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !accessCode}
                className="group w-full h-14 rounded-2xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 text-white font-normal text-sm uppercase tracking-[0.3em] transition-all disabled:opacity-40"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    확인 중
                  </>
                ) : (
                  <span className="inline-flex items-center gap-3 pl-[0.3em]">
                    Enter
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>

            <p className="mt-6 text-[11px] text-center text-slate-500">
              액세스 코드는 관리자에게 문의하세요
            </p>
          </div>
        </div>

        <p className="text-center mt-7 text-[10px] tracking-[0.28em] text-slate-600 uppercase">
          ORUN English · Secure Portal
        </p>
      </div>
    </div>
  );
};

export default AccessCodeForm;
