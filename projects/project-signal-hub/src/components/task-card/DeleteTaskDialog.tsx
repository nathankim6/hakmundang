
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Task } from "@/lib/types";

interface DeleteTaskDialogProps {
  isOpen?: boolean;
  open?: boolean; // Added to match passed props
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
  onConfirm?: () => void; // Added to match passed props
  taskTitle?: string;
  task?: Task; // Added to match passed props
  isLoading?: boolean; // Added to match passed props
}

export function DeleteTaskDialog({ 
  isOpen, 
  open, 
  onOpenChange, 
  onDelete, 
  onConfirm, 
  taskTitle, 
  task,
  isLoading
}: DeleteTaskDialogProps) {
  // Use either open or isOpen, with isOpen taking precedence
  const isDialogOpen = isOpen !== undefined ? isOpen : open;
  
  // Use either onConfirm or onDelete callback
  const handleConfirm = onConfirm || onDelete;
  
  // Use either taskTitle or task.title if available
  const title = taskTitle || (task ? task.title : "");

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600 dark:text-red-400">⚠️ 업무 영구 삭제</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p className="font-medium">"{title}" 업무를 영구적으로 삭제하시겠습니까?</p>
            <p className="text-sm text-muted-foreground">이 작업은 되돌릴 수 없으며, 모든 관련 데이터가 완전히 삭제됩니다.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? '삭제 중...' : '영구 삭제'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
