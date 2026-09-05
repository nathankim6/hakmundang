
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

interface EndTestDialogProps {
  disabled: boolean;
  onEndTest: (accessCode: string) => Promise<boolean>;
  testId: string;
  onDelete: () => void;
}

const EndTestDialog = ({ disabled, onEndTest, testId, onDelete }: EndTestDialogProps) => {
  const [accessCode, setAccessCode] = useState('');
  const [showAccessCodeDialog, setShowAccessCodeDialog] = useState(false);

  const handleEndTest = async () => {
    if (accessCode === '101100') {
      const success = await onEndTest(accessCode);
      if (success) {
        // After successfully ending the test, trigger the delete function
        onDelete();
        setShowAccessCodeDialog(false);
        setAccessCode('');
        toast({
          title: "시험이 종료되고 삭제되었습니다",
          description: "관리자 권한으로 시험이 종료 및 삭제되었습니다.",
        });
      }
    } else {
      toast({
        title: "액세스 코드가 올바르지 않습니다",
        description: "올바른 관리자 액세스 코드를 입력해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={showAccessCodeDialog} onOpenChange={setShowAccessCodeDialog}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="border-red-500 text-red-500 hover:bg-red-50 w-full sm:w-auto"
          disabled={disabled}
        >
          <Power className="h-4 w-4 mr-2" />
          시험 종료
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[95vw] w-[400px] mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>관리자 액세스 코드 입력</AlertDialogTitle>
          <AlertDialogDescription>
            시험을 종료하고 삭제하려면 관리자 액세스 코드를 입력하세요.
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
