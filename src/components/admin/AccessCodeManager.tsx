import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Shuffle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AccessCode = Database['public']['Tables']['access_codes']['Row'];
type AccessCodeUsage = Database['public']['Tables']['access_code_usage']['Row'];

interface AccessCodeWithLastAccess extends AccessCode {
  last_access?: string;
}

export const AccessCodeManager = () => {
  const [newCode, setNewCode] = useState("");
  const [expiryDays, setExpiryDays] = useState("");
  const [accessCodes, setAccessCodes] = useState<AccessCodeWithLastAccess[]>([]);
  const [extensionDays, setExtensionDays] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccessCodes();
  }, []);

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 8;
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    setNewCode(result);
  };

  const fetchAccessCodes = async () => {
    // First, fetch all access codes
    const { data: codesData, error: codesError } = await supabase
      .from('access_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (codesError) {
      toast({
        title: "오류 발생",
        description: "엑세스 코드 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    // Then, fetch the most recent access date for each code
    const { data: usageData, error: usageError } = await supabase
      .from('access_code_usage')
      .select('access_code_id, used_at')
      .order('used_at', { ascending: false });

    if (usageError) {
      toast({
        title: "오류 발생",
        description: "접속 기록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    // Combine the data
    const codesWithLastAccess = codesData.map(code => {
      const lastAccess = usageData
        .filter(usage => usage.access_code_id === code.id)
        .sort((a, b) => new Date(b.used_at!).getTime() - new Date(a.used_at!).getTime())[0]?.used_at;
      
      return {
        ...code,
        last_access: lastAccess
      };
    });

    setAccessCodes(codesWithLastAccess);
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

  const extendExpiry = async (code: AccessCode) => {
    const days = parseInt(extensionDays[code.code] || "0");
    if (!days || days <= 0) {
      toast({
        title: "오류",
        description: "유효한 연장 기간을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const newExpiryDate = new Date(code.expiry_date);
    newExpiryDate.setDate(newExpiryDate.getDate() + days);

    const { error } = await supabase
      .from('access_codes')
      .update({ expiry_date: newExpiryDate.toISOString() })
      .eq('code', code.code);

    if (error) {
      toast({
        title: "오류 발생",
        description: "유효기간 연장에 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    await fetchAccessCodes();
    setExtensionDays(prev => ({ ...prev, [code.code]: "" }));
    
    toast({
      title: "성공",
      description: "유효기간이 성공적으로 연장되었습니다.",
    });
  };

  const copyAccessCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "복사 성공",
        description: "엑세스 코드가 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "엑세스 코드 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const now = new Date();
  const validCodes = accessCodes.filter(code => new Date(code.expiry_date) > now);
  const expiredCodes = accessCodes.filter(code => new Date(code.expiry_date) <= now);

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
            <div className="flex-1 flex space-x-2">
              <Input
                placeholder="새 엑세스 코드..."
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={generateRandomCode}
                title="랜덤 코드 생성"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
            <Input
              type="number"
              placeholder="유효기간 (일)"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              className="w-32"
            />
            <Button onClick={addAccessCode}>추가</Button>
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold">유효한 엑세스 코드</h2>
            {validCodes.map((code) => (
              <div
                key={code.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <div className="flex items-center space-x-4">
                  <span className="font-mono">{code.code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyAccessCode(code.code)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-500">
                    만료: {new Date(code.expiry_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="연장 기간 (일)"
                    value={extensionDays[code.code] || ""}
                    onChange={(e) => setExtensionDays(prev => ({
                      ...prev,
                      [code.code]: e.target.value
                    }))}
                    className="w-32"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => extendExpiry(code)}
                  >
                    연장
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeAccessCode(code.code)}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))}

            <div className="mt-8">
              <h2 className="font-semibold text-gray-500">만료된 엑세스 코드</h2>
              {expiredCodes.map((code) => (
                <div
                  key={code.id}
                  className="flex justify-between items-center p-3 bg-gray-100 rounded mt-2 opacity-75"
                >
                  <div className="flex items-center space-x-4">
                    <span className="font-mono text-gray-500">{code.code}</span>
                    <span className="text-sm text-gray-500">
                      만료: {new Date(code.expiry_date).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      최근 접속: {code.last_access 
                        ? new Date(code.last_access).toLocaleDateString()
                        : '기록 없음'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="연장 기간 (일)"
                      value={extensionDays[code.code] || ""}
                      onChange={(e) => setExtensionDays(prev => ({
                        ...prev,
                        [code.code]: e.target.value
                      }))}
                      className="w-32"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => extendExpiry(code)}
                    >
                      연장
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeAccessCode(code.code)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};