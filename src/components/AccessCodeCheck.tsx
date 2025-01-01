import { useState } from "react";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { Key } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/button";

interface AccessCodeCheckProps {
  onAccessGranted: () => void;
}

export function AccessCodeCheck({ onAccessGranted }: AccessCodeCheckProps) {
  const [code, setCode] = useState("");
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputCode = e.target.value;
    setCode(inputCode);
  };

  const handleSubmit = async () => {
    if (code.length >= 4) {
      // Check for admin code first
      if (code === "101100") {
        onAccessGranted();
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("userName", "관리자");
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] space-y-8">
        <div className="metallic-border rounded-xl bg-white p-8 shadow-2xl">
          <div className="flex flex-col items-center space-y-6">
            {/* Logo and Title */}
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full border-2 border-gray-200 p-0 overflow-hidden flex items-center justify-center bg-white w-24 h-24">
                <img 
                  src="/lovable-uploads/ba25df4b-a62d-4a3d-97c3-7d969e304813.png" 
                  alt="ORUN ACADEMY Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-3xl font-medium animate-title bg-gradient-to-r from-[#403E43] via-[#555555] to-[#403E43] bg-clip-text text-transparent relative group transition-all duration-300">
                <span className="inline-block transform hover:scale-105 transition-transform duration-300 relative">
                  ORUN AI QUIZ MAKER
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer"></span>
                </span>
              </h1>
              {subscriptionExpiry && (
                <p className="text-sm text-gray-600">
                  구독 유효기간: {new Date(subscriptionExpiry).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Access Code Input Section */}
            <div className="w-full max-w-md space-y-4">
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="엑세스 코드를 입력하세요..."
                  value={code}
                  onChange={handleInputChange}
                  className="pl-10 pr-4 py-6 text-lg border-2 focus:border-primary/50 transition-all duration-300"
                />
              </div>
              <Button 
                onClick={handleSubmit}
                className="w-full py-6 text-lg font-medium"
              >
                확인
              </Button>
            </div>

            {/* Additional Info */}
            <p className="text-sm text-muted-foreground text-center">
              엑세스 코드가 필요하신 경우 관리자에게 문의하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}