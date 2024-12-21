import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const AccessVerification = () => {
  const [accessCode, setAccessCode] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accessCode === "101100") {
      navigate("/admin");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("access_codes")
        .select("*")
        .eq("code", accessCode)
        .single();

      if (error) throw error;

      if (data) {
        localStorage.setItem("accessGranted", "true");
        navigate("/quiz");
      } else {
        toast({
          variant: "destructive",
          title: "접근 거부",
          description: "잘못된 접근 코드입니다.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: "접근 코드 확인 중 오류가 발생했습니다.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#F1F0FB] to-[#E5DEFF]">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">ORUN AI QUIZ MAKER</h2>
          <p className="mt-2 text-sm text-gray-600">접근 코드를 입력하세요</p>
        </div>
        <form onSubmit={handleVerification} className="mt-8 space-y-6">
          <div>
            <Input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="접근 코드 입력"
              className="text-center text-lg tracking-wider"
            />
          </div>
          <Button type="submit" className="w-full">
            확인
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AccessVerification;