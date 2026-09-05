import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Wand2, Calendar, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const AccessCodeManager = () => {
  const [newCode, setNewCode] = useState("");
  const [expiryDays, setExpiryDays] = useState("");
  const [accessCodes, setAccessCodes] = useState<Array<{ 
    code: string; 
    expiry_date: string;
    last_accessed?: string | null;
  }>>([]);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<{ code: string; expiry_date: string } | null>(null);
  const [extensionDays, setExtensionDays] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Add useEffect to fetch access codes on component mount
  useEffect(() => {
    fetchAccessCodes();
  }, []);

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const length = 8;
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    
    setNewCode(result);
  };

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

    if (!expiryDays || isNaN(parseInt(expiryDays)) || parseInt(expiryDays) <= 0) {
      toast({
        title: "오류",
        description: "유효한 만료 기간을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // First check if code already exists
    const { data: existingCode } = await supabase
      .from('access_codes')
      .select('code')
      .eq('code', newCode)
      .single();

    if (existingCode) {
      toast({
        title: "중복된 코드",
        description: "이미 존재하는 엑세스 코드입니다.",
        variant: "destructive",
      });
      return;
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));
    
    if (isNaN(expiryDate.getTime())) {
      toast({
        title: "오류 발생",
        description: "유효하지 않은 날짜입니다.",
        variant: "destructive",
      });
      return;
    }
    
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
      console.error("Error adding access code:", error);
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

  const handleExtendClick = (code: string, expiry_date: string) => {
    setSelectedCode({ code, expiry_date });
    setIsExtendDialogOpen(true);
  };

  const extendExpiry = async () => {
    if (!selectedCode || !extensionDays) return;

    const days = parseInt(extensionDays);
    if (!days || days <= 0) {
      toast({
        title: "오류",
        description: "유효한 연장 기간을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const currentDate = new Date(selectedCode.expiry_date);
    if (isNaN(currentDate.getTime())) {
      toast({
        title: "오류 발생",
        description: "유효하지 않은 만료일입니다.",
        variant: "destructive",
      });
      return;
    }

    currentDate.setDate(currentDate.getDate() + days);

    // Validate the new date before proceeding
    if (isNaN(currentDate.getTime())) {
      toast({
        title: "오류 발생",
        description: "유효하지 않은 날짜가 계산되었습니다.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('access_codes')
      .update({ expiry_date: currentDate.toISOString() })
      .eq('code', selectedCode.code);

    if (error) {
      toast({
        title: "오류 발생",
        description: "유효기간 연장에 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    await fetchAccessCodes();
    setIsExtendDialogOpen(false);
    setExtensionDays("");
    setSelectedCode(null);
    
    toast({
      title: "성공",
      description: `유효기간이 ${days}일 연장되었습니다.`,
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

  const formatLastAccessed = (lastAccessed: string | null) => {
    if (!lastAccessed) return "접속 기록 없음";
    const date = new Date(lastAccessed);
    if (isNaN(date.getTime())) return "유효하지 않은 날짜";
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const separateAccessCodes = () => {
    const now = new Date();
    const valid = accessCodes.filter(code => {
      const expiryDate = new Date(code.expiry_date);
      return !isNaN(expiryDate.getTime()) && expiryDate > now;
    });
    const expired = accessCodes.filter(code => {
      const expiryDate = new Date(code.expiry_date);
      return isNaN(expiryDate.getTime()) || expiryDate <= now;
    });
    return { valid, expired };
  };

  const { valid: validCodes, expired: expiredCodes } = separateAccessCodes();

  return (
    <div className="min-h-screen p-6 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100">
      <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9B8FF,transparent)] -z-10" />
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-200/20 blur-3xl animate-pulse -top-48 -left-48" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-blue-200/20 blur-3xl animate-pulse -bottom-48 -right-48" />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />

      <div className="text-center mb-12">
        <h1 className="text-5xl font-nanum font-extrabold tracking-[0.2em] text-[#1A1F2C]">
          엑세스 코드 관리
        </h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 relative">
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("isAdmin");
              navigate("/");
            }}
            className="bg-white/50 backdrop-blur-sm border-purple-200 hover:bg-white/60"
          >
            로그아웃
          </Button>
        </div>

        <div className="bg-white/70 backdrop-blur-md p-6 rounded-lg shadow-lg space-y-4 border border-purple-100">
          <div className="flex space-x-2">
            <div className="flex-1 flex space-x-2">
              <Input
                placeholder="새 엑세스 코드..."
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="bg-white/80"
              />
              <Button 
                variant="outline" 
                onClick={generateRandomCode}
                className="flex items-center gap-2 bg-white/80 hover:bg-purple-50"
              >
                <Wand2 className="h-4 w-4" />
                랜덤 생성
              </Button>
            </div>
            <Input
              type="number"
              placeholder="유효기간 (일)"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              className="w-32 bg-white/80"
            />
            <Button 
              onClick={addAccessCode}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              추가
            </Button>
          </div>

          {/* 유효한 엑세스 코드 섹션 */}
          <div className="space-y-2">
            <h2 className="font-semibold text-purple-900">유효한 엑세스 코드</h2>
            {validCodes.map((code) => (
              <div
                key={code.code}
                className="flex justify-between items-center p-3 bg-white/80 backdrop-blur-sm rounded border border-purple-50 hover:bg-white/90 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <span className="font-mono text-purple-900">{code.code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyAccessCode(code.code)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-purple-700">
                    만료: {new Date(code.expiry_date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-1 text-sm text-purple-600">
                    <Clock className="h-4 w-4" />
                    <span>{formatLastAccessed(code.last_accessed)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExtendClick(code.code, code.expiry_date)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Calendar className="h-4 w-4" />
                    연장
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeAccessCode(code.code)}
                  className="bg-red-500/80 hover:bg-red-600/80"
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>

          {/* 만료된 엑세스 코드 섹션 */}
          {expiredCodes.length > 0 && (
            <div className="space-y-2 mt-8 pt-8 border-t border-purple-100">
              <h2 className="font-semibold text-gray-600">만료된 엑세스 코드</h2>
              {expiredCodes.map((code) => (
                <div
                  key={code.code}
                  className="flex justify-between items-center p-3 bg-gray-100/80 backdrop-blur-sm rounded border border-gray-200 hover:bg-gray-100/90 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <span className="font-mono text-gray-600">{code.code}</span>
                    <span className="text-sm text-gray-500">
                      만료: {new Date(code.expiry_date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{formatLastAccessed(code.last_accessed)}</span>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeAccessCode(code.code)}
                    className="bg-gray-500/80 hover:bg-gray-600/80"
                  >
                    삭제
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-lg border border-purple-100">
          <DialogHeader>
            <DialogTitle className="text-purple-900">엑세스 코드 유효기간 연장</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-purple-700">
                현재 만료일: {selectedCode && new Date(selectedCode.expiry_date).toLocaleDateString()}
              </p>
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  type="number"
                  value={extensionDays}
                  onChange={(e) => setExtensionDays(e.target.value)}
                  placeholder="연장할 일수"
                  className="col-span-4 bg-white/80"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsExtendDialogOpen(false)}
              className="bg-white/80 hover:bg-purple-50"
            >
              취소
            </Button>
            <Button 
              onClick={extendExpiry}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              연장하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
