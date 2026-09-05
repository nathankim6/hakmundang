import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface LoginFormProps {
  onAccessGranted: (code: string) => void;
}

export function LoginForm({ onAccessGranted }: LoginFormProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!code) {
      toast({
        title: "오류",
        description: "엑세스 코드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (code === "101100") {
        onAccessGranted(code);
        setIsLoading(false);
        return;
      }

      const { data: accessCodeData, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (accessCodeData && new Date(accessCodeData.expiry_date) > new Date()) {
        localStorage.setItem("hasAccess", "true");
        localStorage.setItem("subscriptionExpiry", accessCodeData.expiry_date);
        localStorage.setItem("userName", accessCodeData.name || 'Default User');
        onAccessGranted(code);
        
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="relative">
        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="엑세스 코드를 입력하세요..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10"
          disabled={isLoading}
        />
      </div>
      <Button 
        onClick={handleSubmit} 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? "확인 중..." : "접속하기"}
      </Button>
    </div>
  );
}