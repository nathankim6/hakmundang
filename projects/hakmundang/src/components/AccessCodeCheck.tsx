
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
  // Updated background URL as requested
  const fixedBackgroundUrl = "https://wxjazdqabryflvfztujk.supabase.co/storage/v1/object/sign/hakmoondang/20250112_1415_AI%20Quizmaker%20Unveiled_simple_compose_01jhcf0xhvf519j4h32pk0k5xv.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJoYWttb29uZGFuZy8yMDI1MDExMl8xNDE1X0FJIFF1aXptYWtlciBVbnZlaWxlZF9zaW1wbGVfY29tcG9zZV8wMWpoY2YweGh2ZjUxOWo0aDMycGswazV4di5tcDQiLCJpYXQiOjE3NDE0ODU5ODcsImV4cCI6MjM3MjIwNTk4N30.9SSgv1NPm0tlU_NV2FIjpQ1QXsl-3X8-d6KvMqc8ypo";
  const [background, setBackground] = useState<{ url: string; is_video: boolean }>({
    url: fixedBackgroundUrl,
    is_video: true
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch background from Supabase
  useEffect(() => {
    const fetchBackground = async () => {
      try {
        const { data, error } = await supabase
          .from('backgrounds')
          .select('*')
          .limit(1)
          .single();
        
        if (error) {
          console.error("Background fetch error:", error);
          return;
        }
        
        if (data) {
          setBackground(data);
        }
      } catch (error) {
        console.error("Error fetching background:", error);
      }
    };
    
    fetchBackground();
  }, []);

  // Check if user already has access
  useEffect(() => {
    const hasAccess = localStorage.getItem("hasAccess") === "true";
    const lastLoginTime = localStorage.getItem("lastLoginTime");
    
    if (hasAccess && lastLoginTime) {
      // Session is valid, redirect to main page
      navigate("/");
    }
  }, [navigate]);

  const handleAccessCode = (code: string) => {
    console.log("Access granted with code:", code);
    onAccessGranted();
  };

  console.log("Login page background:", background);

  return (
    <div className="min-h-screen flex items-end justify-center relative">
      {background && (
        <BackgroundMedia url={background.url} isVideo={background.is_video} />
      )}
      
      <div className="relative z-10 w-full max-w-md mb-[280px]">
        <div className="p-12">
          <LoginLogo />
          <LoginTitle />
          <LoginForm onAccessGranted={handleAccessCode} />
        </div>
      </div>
    </div>
  );
};
