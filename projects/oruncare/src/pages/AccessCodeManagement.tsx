
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AccessCode {
  id: string;
  code: string;
  name: string;
  created_at: string;
  expiry_date: string;
}

const AccessCodeManagement = () => {
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    fetchAccessCodes();
  }, [isAuthenticated, navigate]);

  const fetchAccessCodes = async () => {
    const { data, error } = await supabase
      .from('orun_access_codes')
      .select('*')
      .neq('code', '101100')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "에러",
        description: "액세스 코드를 불러오는데 실패했습니다.",
      });
      return;
    }

    setAccessCodes(data || []);
  };

  const addAccessCode = async () => {
    if (!newCode || !newName) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "코드와 이름을 모두 입력해주세요.",
      });
      return;
    }

    const { error } = await supabase
      .from('orun_access_codes')
      .insert([
        {
          code: newCode,
          name: newName,
          expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1년 후 만료
        }
      ]);

    if (error) {
      toast({
        variant: "destructive",
        title: "에러",
        description: "액세스 코드 추가에 실패했습니다.",
      });
      return;
    }

    toast({
      title: "성공",
      description: "새로운 액세스 코드가 추가되었습니다.",
    });

    setNewCode('');
    setNewName('');
    fetchAccessCodes();
  };

  const deleteAccessCode = async (id: string) => {
    const { error } = await supabase
      .from('orun_access_codes')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: "에러",
        description: "액세스 코드 삭제에 실패했습니다.",
      });
      return;
    }

    toast({
      title: "성공",
      description: "액세스 코드가 삭제되었습니다.",
    });

    fetchAccessCodes();
  };

  return (
    <div className="min-h-screen bg-gradient-soft p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Button>
          <h1 className="text-3xl font-bold">액세스 코드 관리</h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white/20">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="새 액세스 코드"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="사용자 이름"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addAccessCode} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                추가
              </Button>
            </div>

            <div className="space-y-2">
              {accessCodes.map((code) => (
                <div
                  key={code.id}
                  className="flex items-center justify-between p-4 bg-white/60 rounded-lg border border-gray-200"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{code.name}</p>
                    <p className="text-sm text-gray-500">코드: {code.code}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteAccessCode(code.id)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessCodeManagement;
