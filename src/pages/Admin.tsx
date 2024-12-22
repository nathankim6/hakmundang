import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const [adminCode, setAdminCode] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [expiryDays, setExpiryDays] = useState("7");
  const [accessCodes, setAccessCodes] = useState<Array<{ code: string; expiryDate: number }>>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedCodes = JSON.parse(localStorage.getItem("accessCodes") || "[]");
    setAccessCodes(storedCodes);
    
    const adminStatus = localStorage.getItem("isAdmin");
    if (adminStatus === "true") {
      setIsAdmin(true);
    }
  }, []);

  const handleAdminLogin = () => {
    if (adminCode === "101100") {
      localStorage.setItem("isAdmin", "true");
      setIsAdmin(true);
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

  const addAccessCode = () => {
    if (!newCode) {
      toast({
        title: "오류",
        description: "엑세스 코드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));
    
    const updatedCodes = [
      ...accessCodes,
      { code: newCode, expiryDate: expiryDate.getTime() }
    ];
    
    localStorage.setItem("accessCodes", JSON.stringify(updatedCodes));
    setAccessCodes(updatedCodes);
    setNewCode("");
    
    toast({
      title: "성공",
      description: "새로운 엑세스 코드가 추가되었습니다.",
    });
  };

  const removeAccessCode = (codeToRemove: string) => {
    const updatedCodes = accessCodes.filter(c => c.code !== codeToRemove);
    localStorage.setItem("accessCodes", JSON.stringify(updatedCodes));
    setAccessCodes(updatedCodes);
    
    toast({
      title: "성공",
      description: "엑세스 코드가 삭제되었습니다.",
    });
  };

  if (!isAdmin) {
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
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-white via-[#F1F0FB] to-[#E5DEFF]">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">엑세스 코드 관리</h1>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("isAdmin");
              navigate("/");
            }}
          >
            로그아웃
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="새 엑세스 코드..."
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />
            <Input
              type="number"
              placeholder="유효기간 (일)"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              className="w-32"
            />
            <Button onClick={addAccessCode}>추가</Button>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold">현재 엑세스 코드 목록</h2>
            {accessCodes.map((code) => (
              <div
                key={code.code}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <div>
                  <span className="font-mono">{code.code}</span>
                  <span className="ml-4 text-sm text-gray-500">
                    만료: {new Date(code.expiryDate).toLocaleDateString()}
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeAccessCode(code.code)}
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;