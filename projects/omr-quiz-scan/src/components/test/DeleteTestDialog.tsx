
import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { safeDeleteTest } from "@/utils/testStorage";
import { supabase } from "@/integrations/supabase/client";

interface DeleteTestDialogProps {
  testId?: string;
  onDelete: () => void | Promise<void>;
  title?: string;
  description?: string;
  buttonText?: string;
}

const DeleteTestDialog = ({ 
  testId,
  onDelete, 
  title = "시험을 삭제하시겠습니까?",
  description = "이 작업은 되돌릴 수 없으며, 해당 시험의 모든 결과 데이터도 함께 삭제됩니다.",
  buttonText = "삭제"
}: DeleteTestDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  
  const handleDelete = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!showCodeInput) {
      setShowCodeInput(true);
      return;
    }

    // Verify admin code server-side
    try {
      const { data, error } = await supabase.functions.invoke('verify-access-code', {
        body: { code: adminCode },
      });

      if (error || !data?.valid || !data?.isAdmin) {
        alert('관리자 코드가 올바르지 않습니다.');
        return;
      }
    } catch {
      alert('관리자 코드 확인 중 오류가 발생했습니다.');
      return;
    }

    try {
      setIsDeleting(true);
      console.log("Permanent deletion initiated from DeleteTestDialog");
      
      if (testId) {
        const { data: testData, error: testError } = await supabase
          .from('tests')
          .select('is_ended, title')
          .eq('test_id', testId)
          .single();
          
        if (testError || !testData) {
          throw new Error('시험 정보를 찾을 수 없습니다.');
        }
        
        if (!testData.is_ended) {
          alert('진행 중인 시험은 삭제할 수 없습니다. 먼저 시험을 종료해주세요.');
          return;
        }
      }
      
      if (testId) {
        console.log('Deleting test from server (keeping results):', testId);
        
        const { error: testError } = await supabase
          .from('tests')
          .delete()
          .eq('test_id', testId);
          
        if (testError) {
          console.error('Error deleting test:', testError);
          throw new Error('시험 삭제에 실패했습니다.');
        }
        
        console.log('Test deleted from server (results preserved):', testId);
        try {
          const deleted = JSON.parse(localStorage.getItem('deleted_tests') || '[]');
          if (!deleted.includes(testId)) {
            deleted.push(testId);
            localStorage.setItem('deleted_tests', JSON.stringify(deleted));
          }
        } catch {}
        alert('시험이 서버와 웹에서 영구적으로 삭제되었습니다.');
        onDelete();
      } else {
        await onDelete();
      }
      
      setOpen(false);
      setShowCodeInput(false);
      setAdminCode('');
    } catch (error: any) {
      console.error("Error occurred during deletion:", error);
      alert(`삭제 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 shadow-sm"
          size="icon"
          title="삭제"
          aria-label="삭제"
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent 
        className="bg-white/95 backdrop-blur-sm border border-white/20 max-w-[95vw] w-[400px] mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl text-red-600">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {showCodeInput && (
          <div className="px-6 pb-4">
            <Label htmlFor="adminCode" className="text-sm font-medium text-gray-700">
              관리자 코드
            </Label>
            <Input
              id="adminCode"
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              placeholder="관리자 코드를 입력하세요"
              className="mt-2"
              disabled={isDeleting}
            />
          </div>
        )}
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors mt-2 sm:mt-0 shadow-sm"
            disabled={isDeleting}
            onClick={(e) => e.stopPropagation()}
          >
            취소
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-colors shadow-sm"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                삭제중...
              </>
            ) : (
              buttonText
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTestDialog;
