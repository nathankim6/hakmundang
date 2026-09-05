import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { APIConfigWithAuth } from "@/components/auth/APIConfigWithAuth";
export const AuthContainer = () => {
  const [userName, setUserName] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("hasAccess");
    localStorage.removeItem("subscriptionExpiry");
    localStorage.removeItem("userName");
    localStorage.removeItem("isAdmin");
    toast({
      title: "로그아웃 성공",
      description: "성공적으로 로그아웃되었습니다."
    });
    navigate("/login");
  };
  const handleLogin = async () => {
    try {
      // Check for admin code first
      if (accessCode === "101100") {
        localStorage.setItem("isAdmin", "true");
        toast({
          title: "관리자 모드",
          description: "관리자 모드로 전환되었습니다.",
        });
        navigate("/admin");
        return;
      }

      const {
        data: accessCodeData,
        error
      } = await supabase.from('access_codes').select('*').eq('code', accessCode).maybeSingle();
      if (error) {
        throw error;
      }
      if (accessCodeData && new Date(accessCodeData.expiry_date) > new Date()) {
        localStorage.setItem("hasAccess", "true");
        localStorage.setItem("subscriptionExpiry", accessCodeData.expiry_date);
        localStorage.setItem("userName", accessCodeData.name);
        const formattedDate = new Date(accessCodeData.expiry_date).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        setExpiryDate(formattedDate);
        setUserName(accessCodeData.name);
        setShowLoginForm(false);
        setAccessCode("");
        toast({
          title: "로그인 성공",
          description: "엑세스 코드가 확인되었습니다."
        });
      } else {
        toast({
          title: "로그인 실패",
          description: "유효하지 않은 엑세스 코드입니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "엑세스 코드 확인 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      console.error("Access code check error:", error);
    }
  };
  return <div className="relative group overflow-hidden">
      {/* Premium container with advanced glassmorphism */}
      <div className="relative backdrop-blur-3xl bg-gradient-to-br from-slate-900/95 via-gray-900/98 to-slate-800/95 border border-white/10 shadow-2xl shadow-indigo-500/20 rounded-2xl transition-all duration-700 hover:shadow-3xl hover:shadow-indigo-400/30">
        
        {/* Dynamic background layers */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/8 via-indigo-500/12 to-purple-500/8 opacity-60 group-hover:opacity-90 transition-opacity duration-700" />
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.15),transparent_50%)] mix-blend-overlay" />
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_bottom_right,rgba(147,51,234,0.12),transparent_50%)] mix-blend-overlay" />
        
        {/* Premium floating orbs */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-600/25 rounded-full blur-2xl animate-pulse opacity-70" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-purple-400/15 to-pink-600/20 rounded-full blur-xl animate-pulse delay-1000 opacity-50" />
        <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-gradient-to-br from-emerald-400/10 to-teal-600/15 rounded-full blur-lg animate-pulse delay-500 opacity-40" />
        
        {/* Premium accent borders */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-indigo-500 via-purple-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl" />
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent blur-sm opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
        
        {/* Side accent lines */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-blue-400/40 to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-500 rounded-l-2xl" />
        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-indigo-400/40 to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-500 rounded-r-2xl" />
        
        {/* Main content with premium layout */}
        <div className="relative z-10 p-4 space-y-4">
          {/* Header Section */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-600/30 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg"></div>
                </div>
                <div className="absolute inset-0 rounded-lg bg-blue-400/20 blur-md animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-base font-bold text-transparent bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 bg-clip-text">시스템 제어판</h2>
                <p className="text-xs text-slate-400 font-mono">Advanced Configuration Terminal</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30 animate-pulse delay-200"></div>
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-red-400 to-rose-500 shadow-lg shadow-red-500/30 animate-pulse delay-400"></div>
            </div>
          </div>
          
          {/* Combined Configuration Section */}
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative">
              <div className="animate-fade-in" style={{
              animationDelay: '200ms'
            }}>
                <APIConfigWithAuth showLoginForm={showLoginForm} userName={userName} expiryDate={expiryDate} accessCode={accessCode} setAccessCode={setAccessCode} handleLogin={handleLogin} handleLogout={handleLogout} setShowLoginForm={setShowLoginForm} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Premium border glow effects */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-indigo-500/8 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl"></div>
      </div>
    </div>;
};