import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/lib/supabase";
import { AccessCodeForm } from "./access/AccessCodeForm";
import { AccessCodeHeader } from "./access/AccessCodeHeader";

export function AccessCodeCheck() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleVerification = async (code: string) => {
    if (code.length < 4) {
      toast({
        title: "코드 오류",
        description: "엑세스 코드는 최소 4자리 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    // Check for admin code first
    if (code === "101100") {
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("hasAccess", "true");
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
        localStorage.setItem("hasAccess", "true");
        localStorage.setItem("subscriptionExpiry", accessCode.expiry_date);
        localStorage.setItem("userName", accessCode.name);
        
        toast({
          title: "접속 성공",
          description: "엑세스 코드가 확인되었습니다.",
        });
        
        navigate("/");
      } else {
        toast({
          title: "코드 오류",
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
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] space-y-8">
        <div className="metallic-border rounded-xl bg-white p-8 shadow-2xl">
          <div className="flex flex-col items-center space-y-6">
            <AccessCodeHeader />
            <AccessCodeForm onSubmit={handleVerification} />
            <p className="text-sm text-muted-foreground text-center">
              엑세스 코드가 필요하신 경우 관리자에게 문의하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}