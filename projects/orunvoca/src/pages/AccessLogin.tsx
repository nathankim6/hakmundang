import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { KeyRound, ArrowRight } from "lucide-react";




const AccessLogin = () => {
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast({ title: "오류", description: "액세스 코드를 입력해주세요.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      if (accessCode.trim() === "admin" || accessCode.trim() === "101100" || accessCode.trim() === "orun0088") {
        sessionStorage.removeItem('studentData');
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('accessCode', accessCode.trim());
        toast({ title: "액세스 승인", description: "ORUN VOCA에 오신 것을 환영합니다!" });
        navigate("/dashboard");
        return;
      }
      const { data: accessCodeData, error: accessError } = await supabase
        .from('student_access_codes')
        .select('*')
        .eq('access_code', accessCode.toUpperCase())
        .eq('is_active', true)
        .single();
      if (accessError || !accessCodeData) {
        toast({ title: "액세스 거부", description: "올바른 액세스 코드를 입력해주세요.", variant: "destructive" });
        return;
      }
      if (accessCodeData.expiry_date && new Date(accessCodeData.expiry_date) < new Date()) {
        toast({ title: "로그인 실패", description: "만료된 액세스 코드입니다.", variant: "destructive" });
        return;
      }
      await supabase.from('student_access_codes').update({ last_accessed: new Date().toISOString() }).eq('id', accessCodeData.id);
      sessionStorage.setItem('studentData', JSON.stringify({
        id: accessCodeData.id,
        name: accessCodeData.exam_code || '응시자',
        exam_code: accessCodeData.exam_code,
        access_code: accessCode.toUpperCase()
      }));
      sessionStorage.setItem('accessCode', accessCode.toUpperCase());
      sessionStorage.setItem('user_session_id', accessCode.toUpperCase());
      toast({ title: "로그인 성공", description: `${accessCodeData.exam_code || '응시자'}님 환영합니다!` });
      navigate("/dashboard");
    } catch (error) {
      console.error('Login error:', error);
      toast({ title: "오류", description: "로그인 중 오류가 발생했습니다.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full apple-canvas flex items-center justify-center px-6 py-12 font-['Noto_Sans_KR',sans-serif]">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        {/* Featured lead block */}
        <section className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <p className="apple-eyebrow">Learning Management System</p>
            <h1
              className="mt-7 text-[#8b7355] text-[46px] sm:text-[68px] leading-none"
              style={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 700 }}
            >
              ORUN VOCA
            </h1>
            <h2 className="mt-6 text-[26px] sm:text-[32px] font-light leading-tight tracking-tight text-[#1a1a1a]">
              단어장, 모의시험, 그리고<br />
              <span className="font-medium border-b-2 border-[#c9b99a]">누적 성장 리포트</span>까지.
            </h2>
            <p className="mt-6 max-w-md text-[13px] text-[#8b7355] leading-relaxed">
              옳은영어 어휘학습 플랫폼. 체계적인 반복 학습과 누적 성장 리포트, 적응형 모의시험으로
              어휘력을 단계별로 완성합니다.
            </p>
          </div>
          <div className="mt-10 hidden lg:flex gap-2">
            <span className="apple-chip">Vocathon</span>
            <span className="apple-chip">개인 리포트</span>
            <span className="apple-chip">누적 성장 분석</span>
          </div>
        </section>

        {/* Structured index / login block */}
        <section className="lg:col-span-5 flex flex-col">
          <div className="ed-surface p-8 sm:p-10">
            <h3 className="ed-rule-head">01 / Portal Access</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.14em] mb-1 text-[#8b7355] font-bold">Access Code</label>
                <div className="relative">
                  <KeyRound className="absolute right-1 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#c9b99a]" />
                  <input
                    type="password"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="관리자 또는 학생 코드"
                    className="apple-input pr-7"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="apple-btn-quiet w-full py-3 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#c9b99a] border-t-[#8b7355] rounded-full animate-spin" />
                    인증 중
                  </>
                ) : (
                  <>
                    Enter Classroom
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <h3 className="ed-rule-head mt-10">02 / Directory</h3>
            <ul className="space-y-1">
              {[
                { label: '단어장', state: 'BROWSE' },
                { label: '모의시험', state: 'LOCKED' },
                { label: '누적 성장 리포트', state: 'LOCKED' },
              ].map((row) => (
                <li key={row.label} className="ed-index-row">
                  <span className={`text-[13px] ${row.state === 'BROWSE' ? 'text-[#1a1a1a] font-medium' : 'text-[#1a1a1a]/55'}`}>{row.label}</span>
                  <span className="ed-dotline" />
                  <span className="text-[9px] font-bold tracking-[0.14em] text-[#8b7355]">{row.state}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex justify-between text-[10px] font-medium tracking-[0.08em] text-[#8b7355]">
            <span>VOL. 2026 · ORUN ENGLISH</span>
            <span>© All rights reserved</span>
          </div>
        </section>
      </div>
    </div>
  );
};




export default AccessLogin;
