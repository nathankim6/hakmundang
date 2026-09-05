
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin = ({ onLoginSuccess }: AdminLoginProps) => {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-access-code', {
        body: { code: accessCode },
      });

      if (error) throw error;

      if (!data?.valid) {
        throw new Error(data?.reason === 'expired' ? 'Access code expired' : 'Invalid access code');
      }

      // Store the verified access code
      sessionStorage.setItem('verifiedAccessCode', accessCode);
      onLoginSuccess();
      toast({
        title: "로그인 성공",
        description: "시험 결과를 확인할 수 있습니다.",
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "로그인 실패",
        description: "올바른 액세스 코드를 입력해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-emerald-50/30 flex items-center justify-center">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">관리자 로그인</h1>
          <p className="text-sm text-gray-500">시험 결과를 확인하려면 액세스 코드를 입력하세요.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accessCode">액세스 코드</Label>
            <Input
              id="accessCode"
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="액세스 코드를 입력하세요"
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "확인 중..." : "확인"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
