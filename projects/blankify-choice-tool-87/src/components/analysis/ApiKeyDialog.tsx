
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { Key, Check } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ApiKeyDialogProps {
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
  isApiConnected: boolean;
  setIsApiConnected: (isConnected: boolean) => void;
  dialogOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({
  openaiApiKey,
  setOpenaiApiKey,
  isApiConnected,
  setIsApiConnected,
  dialogOpen,
  setDialogOpen
}) => {
  const { toast } = useToast();

  const saveApiKey = () => {
    if (openaiApiKey) {
      setIsApiConnected(true);
      setDialogOpen(false);
      toast({
        title: "API 키 설정 완료",
        description: "OpenAI API 키가 성공적으로 설정되었습니다."
      });
    } else {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "유효한 API 키를 입력해주세요."
      });
    }
  };

  const testApiConnection = async () => {
    try {
      const response = await fetch('https://jpanpwbdlhsxnyaldddm.supabase.co/functions/v1/analyze-passage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passages: [{
            englishText: 'Hello world',
            koreanText: '안녕 세상',
            passageNumber: 1
          }],
          apiKey: openaiApiKey
        }),
      });

      if (!response.ok) {
        throw new Error('API 키가 유효하지 않습니다.');
      }

      setIsApiConnected(true);
      toast({
        title: "API 연결 성공",
        description: "OpenAI API와 성공적으로 연결되었습니다."
      });
    } catch (error) {
      console.error("API test error:", error);
      setIsApiConnected(false);
      toast({
        variant: "destructive",
        title: "API 연결 실패",
        description: error instanceof Error ? error.message : "API 연결 중 오류가 발생했습니다."
      });
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={isApiConnected ? "outline" : "secondary"} size="sm" className={cn("transition-all duration-200", isApiConnected ? "text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200" : "text-amber-600 hover:text-amber-700 hover:bg-amber-50")}>
          {isApiConnected ? <><Check className="h-4 w-4 mr-2" /> API 연결됨</> : <><Key className="h-4 w-4 mr-2" /> API 설정</>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>OpenAI API 키 설정</DialogTitle>
          <DialogDescription>
            분석 기능을 사용하기 위해 OpenAI API 키를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input id="apiKey" value={openaiApiKey} onChange={e => setOpenaiApiKey(e.target.value)} placeholder="sk-..." className="col-span-4" type="password" />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={testApiConnection} disabled={!openaiApiKey}>
            연결 테스트
          </Button>
          <Button type="button" onClick={saveApiKey} disabled={!openaiApiKey}>
            저장하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
