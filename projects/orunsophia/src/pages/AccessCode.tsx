
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockIcon } from 'lucide-react';

interface AccessCodeProps {
  onSuccess?: () => void;
}

const AccessCode = ({ onSuccess }: AccessCodeProps) => {
  const [code, setCode] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (error) throw error;

      if (new Date(data.expiry_date) < new Date()) {
        toast({
          title: "인증 오류",
          description: "만료된 엑세스 코드입니다.",
          variant: "destructive"
        });
        return;
      }

      await supabase
        .from('access_codes')
        .update({ last_accessed: new Date().toISOString() })
        .eq('code', data.code);

      localStorage.setItem('access_code', data.code);
      localStorage.setItem('is_admin', data.is_admin ? 'true' : 'false');

      if (onSuccess) {
        onSuccess();
      }

      // Redirect admin users to the generate-code page
      if (data.is_admin) {
        navigate('/generate-code');
      } else {
        navigate('/');
      }

      toast({
        title: "로그인 성공",
        description: `환영합니다, ${data.user_name}님!`,
      });

    } catch (error) {
      toast({
        title: "인증 오류",
        description: "유효하지 않은 엑세스 코드입니다.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-toss-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <LockIcon className="mx-auto h-12 w-12 text-toss-blue mb-4" />
          <h2 className="text-xl font-bold">엑세스 코드 입력</h2>
          <p className="text-toss-textSecondary">서비스를 이용하려면 엑세스 코드가 필요합니다</p>
        </div>
        
        <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
          <Input 
            value={code}
            onChange={(e) => setCode(e.target.value)} // Remove toUpperCase() to allow lowercase input
            placeholder="엑세스 코드를 입력하세요"
            className="w-full"
            maxLength={8}
          />
          <Button type="submit" className="w-full">
            제출
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AccessCode;

