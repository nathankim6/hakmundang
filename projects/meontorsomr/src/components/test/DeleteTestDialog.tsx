
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
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

interface DeleteTestDialogProps {
  onDelete: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
}

const DeleteTestDialog = ({ 
  onDelete, 
  title = "시험을 삭제하시겠습니까?",
  description = "이 작업은 되돌릴 수 없으며, 해당 시험의 모든 결과 데이터도 함께 삭제됩니다.",
  buttonText = "삭제"
}: DeleteTestDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          size="icon"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white/95 backdrop-blur-sm border border-white/20 max-w-[95vw] w-[400px] mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="border-[#9F9EA1] mt-2 sm:mt-0">취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            {buttonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTestDialog;
