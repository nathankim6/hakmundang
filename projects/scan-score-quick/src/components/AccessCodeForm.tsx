
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, LockKeyhole, ShieldCheck, Loader2, Sparkles } from 'lucide-react';
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
        localStorage.setItem('accessAcademy', data.academy || 'brainiac');
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
      {/* Cosmic background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-32 w-[560px] h-[560px] rounded-full bg-sky-500/20 blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-fuchsia-500/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="group inline-flex items-center gap-1.5 mb-6 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          돌아가기
        </button>

        {/* Card */}
        <div className="relative rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Top sheen */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="px-8 pt-10 pb-8">
            {/* Lock icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 blur-xl opacity-60" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shadow-lg">
                  <LockKeyhole className="h-7 w-7 text-white" strokeWidth={1.75} />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                <Sparkles className="h-3 w-3 text-amber-300" />
                <span className="text-[10px] font-semibold tracking-[0.18em] text-slate-300 uppercase">
                  Admin Access
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                시험 결과 확인
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                관리자 인증이 필요한 페이지입니다
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-8">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                  액세스 코드
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    type="text"
                    placeholder="••••••••"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    disabled={isLoading}
                    autoFocus
                    className="h-12 pl-10 pr-3 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-indigo-400/60 focus-visible:border-indigo-400/40 tracking-[0.3em] text-base"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !accessCode}
                className="w-full h-12 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-sm shadow-lg shadow-white/10 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    확인 중...
                  </>
                ) : (
                  '확인'
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-black/20 border-t border-white/5">
            <p className="text-[11px] text-center text-slate-500">
              액세스 코드는 관리자에게 문의하세요
            </p>
          </div>
        </div>

        {/* Subtle brand */}
        <p className="text-center mt-6 text-[10px] tracking-[0.2em] text-slate-600 uppercase">
          Brainiac English · Secure Portal
        </p>
      </div>
    </div>
  );
};

export default AccessCodeForm;
