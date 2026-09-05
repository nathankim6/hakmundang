
import { useState, useEffect } from "react";
import { LoginForm } from "./login/LoginForm";
import { LoginTitle } from "./login/LoginTitle";
import { LoginLogo } from "./login/LoginLogo";
import { BackgroundMedia } from "./login/BackgroundMedia";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";

interface AccessCodeCheckProps {
  onAccessGranted: () => void;
}

export const AccessCodeCheck = ({ onAccessGranted }: AccessCodeCheckProps) => {
  const [background, setBackground] = useState<{ url: string; is_video: boolean }>({
    url: "https://offvlzgotgqlnecpktfn.supabase.co/storage/v1/object/public/backgrounds/20250308_2204_Mentors%20Table%20Reveal_simple_compose_01jntxqdxbechrj4hydys1x2dq.mp4",
    is_video: true
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRandomBackground = async () => {
      const { data: countData } = await supabase
        .from('backgrounds')
        .select('id', { count: 'exact' });

      if (countData) {
        const count = countData.length;
        const randomOffset = Math.floor(Math.random() * count);

        const { data, error } = await supabase
          .from('backgrounds')
          .select('url, is_video')
          .range(randomOffset, randomOffset)
          .limit(1);

        if (!error && data && data.length > 0) {
          setBackground(data[0]);
        }
      }
    };

    fetchRandomBackground();
  }, []);

  const handleAccessCode = async (code: string) => {
    if (code === "101100") {
      localStorage.setItem("isAdmin", "true");
      toast({
        title: "관리자 모드",
        description: "관리자 모드로 전환되었습니다.",
      });
      navigate("/admin");
      return;
    }

    const { data, error } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      toast({
        title: "오류",
        description: "엑세스 코드 확인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      const expiryDate = new Date(data.expiry_date);
      if (expiryDate > new Date()) {
        localStorage.setItem("hasAccess", "true");
        localStorage.setItem("lastLoginTime", Date.now().toString());
        localStorage.setItem("subscriptionExpiry", expiryDate.toISOString());
        localStorage.setItem("userName", data.name);
        onAccessGranted();
      } else {
        toast({
          title: "만료된 코드",
          description: "엑세스 코드가 만료되었습니다.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "잘못된 코드",
        description: "올바르지 않은 엑세스 코드입니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-end relative pb-24">
      <BackgroundMedia url={background.url} isVideo={background.is_video} />
      
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="p-8 rounded-lg bg-white/20 backdrop-blur-sm shadow-lg">
          <LoginLogo />
          <LoginTitle />
          <LoginForm onAccessGranted={handleAccessCode} />
        </div>
      </div>
    </div>
  );
};
