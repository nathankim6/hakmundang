import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoginLogo } from "./login/LoginLogo";
import { LoginTitle } from "./login/LoginTitle";
import { LoginForm } from "./login/LoginForm";
import { BackgroundMedia } from "./login/BackgroundMedia";
import type { Database } from "@/integrations/supabase/types";

interface AccessCodeCheckProps {
  onAccessGranted: () => void;
}

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export function AccessCodeCheck({ onAccessGranted }: AccessCodeCheckProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    if (code.length < 4) {
      toast({
        title: "입력 오류",
        description: "엑세스 코드는 최소 4자리 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
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

      const { data: accessCode, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error("데이터베이스 접근 중 오류가 발생했습니다.");
      }

      if (!accessCode) {
        toast({
          title: "접속 실패",
          description: "유효하지 않은 엑세스 코드입니다.",
          variant: "destructive",
        });
        return;
      }

      if (new Date(accessCode.expiry_date) <= new Date()) {
        toast({
          title: "접속 실패",
          description: "만료된 엑세스 코드입니다.",
          variant: "destructive",
        });
        return;
      }

      onAccessGranted();
      localStorage.setItem("userName", accessCode.name || '');
      localStorage.setItem("hasAccess", "true");
      localStorage.setItem("lastLoginTime", Date.now().toString());
      localStorage.setItem("subscriptionExpiry", accessCode.expiry_date);
      setSubscriptionExpiry(accessCode.expiry_date);
      
      toast({
        title: "접속 성공",
        description: "엑세스 코드가 확인되었습니다.",
      });
      navigate("/");

    } catch (error) {
      console.error("Access code check error:", error);
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "엑세스 코드 확인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <BackgroundMedia
        url="https://wxjazdqabryflvfztujk.supabase.co/storage/v1/object/sign/hakmoondang/20250112_1415_AI%20Quizmaker%20Unveiled_simple_compose_01jhcf0xhvf519j4h32pk0k5xv.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJoYWttb29uZGFuZy8yMDI1MDExMl8xNDE1X0FJIFF1aXptYWtlciBVbnZlaWxlZF9zaW1wbGVfY29tcG9zZV8wMWpoY2YweGh2ZjUxOWo0aDMycGswazV4di5tcDQiLCJpYXQiOjE3MzY2NjAwNDUsImV4cCI6MjA1MjAyMDA0NX0.J2_yG0K_2L7mdHFnRfblI3QiKF-YDaafg17xO7Vbc3k&t=2025-01-12T05%3A34%3A05.338Z"
        isVideo={true}
      />
      
      <div className="fixed bottom-0 left-0 right-0 z-50 p-8 bg-black/30 backdrop-blur-sm">
        <div className="mx-auto max-w-lg">
          <div className="flex flex-col items-center space-y-8">
            <LoginLogo />
            <LoginTitle subscriptionExpiry={subscriptionExpiry} />
            <LoginForm 
              code={code}
              onCodeChange={handleInputChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}