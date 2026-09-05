import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const AdminLogin = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const [adminCode, setAdminCode] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    if (adminCode === "101100") {
      localStorage.setItem("isAdmin", "true");
      onLoginSuccess();
      toast({
        title: "로그인 성공",
        description: "관리자로 로그인되었습니다.",
      });
    } else {
      toast({
        title: "로그인 실패",
        description: "잘못된 관리자 코드입니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#F1F0FB] to-[#E5DEFF]">
      <div className="w-full max-w-md space-y-4 p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">관리자 로그인</h1>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="관리자 코드 입력..."
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
          />
          <div className="flex space-x-2">
            <Button onClick={handleAdminLogin} className="flex-1">
              로그인
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="flex-1">
              돌아가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};