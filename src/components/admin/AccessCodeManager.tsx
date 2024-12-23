import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export const AccessCodeManager = () => {
  const [newCode, setNewCode] = useState("");
  const [expiryDays, setExpiryDays] = useState("7");
  const [accessCodes, setAccessCodes] = useState<Array<{ code: string; expiry_date: string }>>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccessCodes();
  }, []);

  const fetchAccessCodes = async () => {
    const { data, error } = await supabase
      .from('access_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "오류 발생",
        description: "엑세스 코드 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    setAccessCodes(data || []);
  };

  const addAccessCode = async () => {
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
    
    const { error } = await supabase
      .from('access_codes')
      .insert([{ 
        code: newCode, 
        expiry_date: expiryDate.toISOString() 
      }]);

    if (error) {
      toast({
        title: "오류 발생",
        description: "엑세스 코드 추가에 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    await fetchAccessCodes();
    setNewCode("");
    
    toast({
      title: "성공",
      description: "새로운 엑세스 코드가 추가되었습니다.",
    });
  };

  const removeAccessCode = async (codeToRemove: string) => {
    const { error } = await supabase
      .from('access_codes')
      .delete()
      .eq('code', codeToRemove);

    if (error) {
      toast({
        title: "오류 발생",
        description: "엑세스 코드 삭제에 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    await fetchAccessCodes();
    
    toast({
      title: "성공",
      description: "엑세스 코드가 삭제되었습니다.",
    });
  };

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
                    만료: {new Date(code.expiry_date).toLocaleDateString()}
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