import { QuestionGenerator } from "@/components/QuestionGenerator";
import { APIConfig } from "@/components/APIConfig";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Key } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const [userName, setUserName] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedExpiry = localStorage.getItem("subscriptionExpiry");
    if (storedExpiry) {
      const formattedDate = new Date(storedExpiry).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      setExpiryDate(formattedDate);
    }

    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("hasAccess");
    localStorage.removeItem("subscriptionExpiry");
    localStorage.removeItem("userName");
    localStorage.removeItem("isAdmin");
    
    toast({
      title: "로그아웃 성공",
      description: "성공적으로 로그아웃되었습니다.",
    });
    
    navigate("/login");
  };

  const handleLogin = async () => {
    try {
      const { data: accessCodeData, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', accessCode)
        .maybeSingle();

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
          description: "엑세스 코드가 확인되었습니다.",
        });
      } else {
        toast({
          title: "로그인 실패",
          description: "유효하지 않은 엑세스 코드입니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "엑세스 코드 확인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      console.error("Access code check error:", error);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F1F0FB] to-[#E5DEFF] z-0" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="flex flex-col space-y-8">
          {/* Title Section with enhanced styling */}
          <div className="flex items-center justify-center space-x-6">
            <img 
              src="/lovable-uploads/352a49ca-b123-4f07-992a-cf59e4b7058a.png" 
              alt="ORUN ACADEMY Logo" 
              className="w-32 h-32 object-contain"
            />
            
            <div className="flex flex-col items-center animate-title-container">
              <h1 
                className="text-7xl font-bold animate-title tracking-wider relative group"
                data-text="ORUN AI QUIZ MAKER"
              >
                <span className="inline-block transform transition-transform group-hover:scale-105 duration-300">
                  ORUN AI QUIZ MAKER
                </span>
              </h1>
            </div>
          </div>

          {/* Decorative line with enhanced styling */}
          <div className="relative h-1 max-w-2xl mx-auto overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#EC4899] to-transparent animate-pulse opacity-30" />
          </div>

          {/* Login/Config Section */}
          <div className="metallic-border rounded-xl p-4 backdrop-blur-lg bg-gradient-to-b from-white/90 to-gray-50/90">
            {showLoginForm ? (
              <div className="mb-3 p-4 bg-white/80 rounded-lg border border-gray-100">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="엑세스 코드를 입력하세요..."
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleLogin}>로그인</Button>
                  <Button variant="outline" onClick={() => setShowLoginForm(false)}>취소</Button>
                </div>
              </div>
            ) : (userName || expiryDate) ? (
              <div className="mb-3 text-sm flex items-center justify-between bg-white/80 rounded-lg p-2 border-b border-gray-100">
                <div className="flex-1 text-left space-x-4 text-[#0EA5E9]">
                  {userName && <span>사용자: {userName}</span>}
                  {expiryDate && <span>만료일: {expiryDate}</span>}
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  로그아웃
                </Button>
              </div>
            ) : (
              <div className="mb-3 flex justify-end">
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLoginForm(true)}
                  className="text-[#0EA5E9] hover:text-[#0EA5E9]/80"
                >
                  <Key className="h-4 w-4 mr-1" />
                  엑세스 코드로 로그인
                </Button>
              </div>
            )}
            <APIConfig />
          </div>
          
          {/* Main Content Section */}
          <div className="metallic-border rounded-xl p-8">
            <QuestionGenerator />
          </div>
        </div>
      </div>

      <footer className="mt-16 text-center relative z-10">
        <p className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          © 2024 ORUN AI QUIZ MAKER. All rights reserved by 옳은영어 김성진T
        </p>
      </footer>
    </div>
  );
};

export default Index;
