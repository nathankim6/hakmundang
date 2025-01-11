import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/lib/supabase";
import { LoginLogo } from "./login/LoginLogo";
import { LoginTitle } from "./login/LoginTitle";
import { LoginForm } from "./login/LoginForm";
import { BackgroundMedia } from "./login/BackgroundMedia";

interface AccessCodeCheckProps {
  onAccessGranted: () => void;
}

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export function AccessCodeCheck({ onAccessGranted }: AccessCodeCheckProps) {
  const [code, setCode] = useState("");
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const lastLoginTime = localStorage.getItem("lastLoginTime");
    const hasAccess = localStorage.getItem("hasAccess");
    
    if (lastLoginTime && hasAccess) {
      const timeDiff = Date.now() - parseInt(lastLoginTime);
      if (timeDiff < SESSION_TIMEOUT) {
        onAccessGranted();
        navigate("/");
      } else {
        handleLogout();
      }
    }

    const intervalId = setInterval(() => {
      const lastLogin = localStorage.getItem("lastLoginTime");
      if (lastLogin) {
        const timeDiff = Date.now() - parseInt(lastLogin);
        if (timeDiff >= SESSION_TIMEOUT) {
          handleLogout();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [navigate, onAccessGranted]);

  const handleLogout = () => {
    localStorage.removeItem("hasAccess");
    localStorage.removeItem("lastLoginTime");
    localStorage.removeItem("subscriptionExpiry");
    localStorage.removeItem("userName");
    localStorage.removeItem("isAdmin");
    navigate("/login");
    toast({
      title: "세션 만료",
      description: "보안을 위해 자동으로 로그아웃되었습니다.",
      variant: "destructive",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const handleSubmit = async () => {
    if (code.length >= 4) {
      if (code === "101100") {
        onAccessGranted();
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("userName", "관리자");
        localStorage.setItem("hasAccess", "true");
        localStorage.setItem("lastLoginTime", Date.now().toString());
        toast({
          title: "관리자 로그인 성공",
          description: "관리자 페이지로 이동합니다.",
        });
        navigate("/admin");
        return;
      }

      try {
        const { data: accessCode, error } = await supabase
          .from('access_codes')
          .select('*')
          .eq('code', code)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (accessCode && new Date(accessCode.expiry_date) > new Date()) {
          onAccessGranted();
          localStorage.setItem("userName", accessCode.name);
          localStorage.setItem("hasAccess", "true");
          localStorage.setItem("lastLoginTime", Date.now().toString());
          localStorage.setItem("subscriptionExpiry", accessCode.expiry_date);
          setSubscriptionExpiry(accessCode.expiry_date);
          toast({
            title: "접속 성공",
            description: "엑세스 코드가 확인되었습니다.",
          });
          navigate("/");
        } else {
          toast({
            title: "접속 실패",
            description: "유효하지 않은 엑세스 코드입니다.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Access code check error:", error);
        toast({
          title: "오류 발생",
          description: "엑세스 코드 확인 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <BackgroundMedia
        url="https://jpanpwbdlhsxnyaldddm.supabase.co/storage/v1/object/public/backgrounds/20250105_1334_Lighthouse%20Guardianship_simple_compose_01jgtbw8pnfgab82e4whsqq2dm%20(1).mp4"
        isVideo={true}
      />
      
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] space-y-8">
        <div className="rounded-xl p-8">
          <div className="flex flex-col items-center space-y-8">
            <LoginLogo />
            <LoginTitle subscriptionExpiry={subscriptionExpiry} />
            <LoginForm 
              code={code}
              onCodeChange={handleInputChange}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}