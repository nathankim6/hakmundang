
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";

interface AccessCodeFormProps {
  onSuccess: () => void;
}

const ACCESS_CODE = "101100";

const AccessCodeForm = ({ onSuccess }: AccessCodeFormProps) => {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate server verification
    setTimeout(() => {
      if (accessCode === ACCESS_CODE) {
        localStorage.setItem('resultsAccessGranted', 'true');
        onSuccess();
        toast({
          title: "접근 권한 획득",
          description: "시험 결과를 확인할 수 있습니다.",
          variant: "default"
        });
      } else {
        toast({
          title: "잘못된 액세스 코드",
          description: "올바른 액세스 코드를 입력해주세요.",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50">
      <div className="max-w-md mx-auto pt-8">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            className="text-slate-600 hover:text-slate-800 hover:bg-slate-100" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
        </div>
        
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-sky-500 to-indigo-500 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <LockKeyhole className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center">시험 결과 확인</h2>
            <p className="text-sm text-center mt-2 text-sky-100">
              관리자 인증이 필요한 페이지입니다
            </p>
          </div>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">액세스 코드</label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="액세스 코드를 입력하세요"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600"
                disabled={isLoading}
              >
                {isLoading ? "확인 중..." : "확인"}
              </Button>
              
              <p className="text-xs text-center text-slate-500 mt-4">
                액세스 코드는 관리자에게 문의하세요
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessCodeForm;
