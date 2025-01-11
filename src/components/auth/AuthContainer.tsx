import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { LoginSection } from "@/components/auth/LoginSection";
import { APIConfig } from "@/components/APIConfig";

export const AuthContainer = () => {
  const [userName, setUserName] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

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
    <div className="metallic-border rounded-xl p-4 backdrop-blur-lg bg-gradient-to-b from-white/90 to-gray-50/90">
      <LoginSection 
        showLoginForm={showLoginForm}
        userName={userName}
        expiryDate={expiryDate}
        accessCode={accessCode}
        setAccessCode={setAccessCode}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        setShowLoginForm={setShowLoginForm}
      />
      <APIConfig />
    </div>
  );
};