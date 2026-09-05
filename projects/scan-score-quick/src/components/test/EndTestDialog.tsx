
import React, { useState } from 'react';
import { Power } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

interface EndTestDialogProps {
  disabled: boolean;
  onEndTest: (accessCode: string) => Promise<boolean>;
  testId: string;
}

const EndTestDialog = ({ disabled, onEndTest, testId }: EndTestDialogProps) => {
  const [accessCode, setAccessCode] = useState('');
  const [showAccessCodeDialog, setShowAccessCodeDialog] = useState(false);

  const handleEndTest = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-access-code', {
        body: { code: accessCode },
      });

      if (error || !data?.valid || !data?.isAdmin) {
        toast({
          title: "액세스 코드가 올바르지 않습니다",
          description: "올바른 관리자 액세스 코드를 입력해주세요.",
          variant: "destructive",
        });
        return;
      }

      const success = await onEndTest(accessCode);
      if (success) {
        setShowAccessCodeDialog(false);
        setAccessCode('');
        toast({
          title: "시험이 종료되었습니다",
          description: "시험이 성공적으로 종료되었습니다. 결과는 여전히 저장되어 있습니다.",
        });
      }
    } catch {
      toast({
        title: "오류 발생",
        description: "액세스 코드 확인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={showAccessCodeDialog} onOpenChange={setShowAccessCodeDialog}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                disabled={disabled}
              >
                <Power className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>시험 종료</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <AlertDialogContent className="max-w-[95vw] w-[400px] mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>관리자 액세스 코드 입력</AlertDialogTitle>
          <AlertDialogDescription>
            시험을 종료하려면 관리자 액세스 코드를 입력하세요. 시험 결과는 보존됩니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Input
            type="password"
            placeholder="액세스 코드 입력"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
          />
        </div>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={() => {
            setAccessCode('');
            setShowAccessCodeDialog(false);
          }} className="mt-2 sm:mt-0">
            취소
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleEndTest}>
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EndTestDialog;
